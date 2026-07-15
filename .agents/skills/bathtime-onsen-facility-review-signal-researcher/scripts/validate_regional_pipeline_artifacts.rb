#!/usr/bin/env ruby

require "csv"
require "json"
require "optparse"
require "pathname"

REQUIRED_COLUMNS = %w[
  candidate_slug
  google_visible_pool
  nifty_visible_pool
  yahoo_visible_pool
  locked_pool_status
  locked_pool_sum
  ledger_rows
  full_body_direct_reviews
  partial_review_rows_excluded
  korean_context_bodies_excluded
  facility_related_direct_reviews
  dayuse_only_direct_reviews
  late_hour_or_airport_facility_use_reviews
  lodging_bath_only_direct_reviews
  evidence_grade
  readiness
  p0_decision
  qa_status
  artifact_directory
  direct_body_platform_count
  korean_full_body_direct_reviews
  latest_stratum_seen
  low_rating_stratum_seen
  official_water_profile_status
  review_signal_contract_status
  forbidden_review_signal_rows
  forbidden_review_tags
  legacy_water_method_fields
  invalid_review_signal_rows
].freeze

ARTIFACT_PATTERNS = {
  "platform mapping JSON" => "*_facility_platform_mapping_*.json",
  "review signal CSV" => "*_facility_review_signal_rows_*.csv",
  "summary Markdown" => "*_facility_review_signal_summary_*.md"
}.freeze

options = {}

OptionParser.new do |parser|
  parser.banner = "Usage: validate_regional_pipeline_artifacts.rb --qa QA.csv [--research-root DIR]"
  parser.on("--qa PATH", "Final deep-research QA CSV") { |value| options[:qa] = value }
  parser.on("--research-root DIR", "Root used to resolve artifact_directory") { |value| options[:research_root] = value }
end.parse!

abort("--qa is required") unless options[:qa]

qa_path = Pathname.new(options[:qa]).expand_path
abort("QA CSV not found: #{qa_path}") unless qa_path.file?

research_root = if options[:research_root]
                  Pathname.new(options[:research_root]).expand_path
                else
                  qa_path.dirname
                end

def integer(value, field, slug, errors, allow_blank: false)
  normalized = value.to_s.delete(",").strip
  return nil if allow_blank && normalized.empty?

  Integer(normalized, 10)
rescue ArgumentError
  errors << "#{slug}: #{field} is not an integer: #{value.inspect}"
  nil
end

def expected_grade(full_body_count)
  return "A" if full_body_count >= 300
  return "B" if full_body_count >= 100
  return "C" if full_body_count >= 50

  "D"
end

def truthy?(value)
  value.to_s.strip.downcase == "true"
end

def stratum_seen?(row, stratum)
  explicit_column = stratum == "latest" ? "is_latest_stratum" : "is_low_rating_stratum"
  return true if truthy?(row[explicit_column])

  normalized = row["sampling_stratum"].to_s.downcase.tr("-", "_")
  tokens = normalized.split(/[;|,]/).map(&:strip)
  return (tokens & %w[low_rating low_rated low]).any? if stratum == "low_rating"

  tokens.include?(stratum)
end

errors = []
rows = CSV.read(qa_path, headers: true)
missing_columns = REQUIRED_COLUMNS - rows.headers
errors << "QA CSV missing columns: #{missing_columns.join(', ')}" unless missing_columns.empty?

seen_slugs = {}

rows.each do |row|
  slug = row["candidate_slug"].to_s.strip
  if slug.empty?
    errors << "row #{row.index}: candidate_slug is blank"
    next
  end

  errors << "#{slug}: duplicate candidate_slug" if seen_slugs[slug]
  seen_slugs[slug] = true

  google = integer(row["google_visible_pool"], "google_visible_pool", slug, errors)
  nifty = integer(row["nifty_visible_pool"], "nifty_visible_pool", slug, errors)
  yahoo = integer(row["yahoo_visible_pool"], "yahoo_visible_pool", slug, errors)
  locked_sum = integer(row["locked_pool_sum"], "locked_pool_sum", slug, errors, allow_blank: true)
  ledger_rows = integer(row["ledger_rows"], "ledger_rows", slug, errors)
  full_body = integer(row["full_body_direct_reviews"], "full_body_direct_reviews", slug, errors)
  partial_excluded = integer(row["partial_review_rows_excluded"], "partial_review_rows_excluded", slug, errors)
  korean_context_excluded = integer(row["korean_context_bodies_excluded"], "korean_context_bodies_excluded", slug, errors)
  facility_related = integer(row["facility_related_direct_reviews"], "facility_related_direct_reviews", slug, errors)
  dayuse = integer(row["dayuse_only_direct_reviews"], "dayuse_only_direct_reviews", slug, errors)
  late_use = integer(row["late_hour_or_airport_facility_use_reviews"], "late_hour_or_airport_facility_use_reviews", slug, errors)
  lodging = integer(row["lodging_bath_only_direct_reviews"], "lodging_bath_only_direct_reviews", slug, errors)
  direct_platforms = integer(row["direct_body_platform_count"], "direct_body_platform_count", slug, errors)
  korean_full_body = integer(row["korean_full_body_direct_reviews"], "korean_full_body_direct_reviews", slug, errors)
  forbidden_rows = integer(row["forbidden_review_signal_rows"], "forbidden_review_signal_rows", slug, errors)
  legacy_fields = integer(row["legacy_water_method_fields"], "legacy_water_method_fields", slug, errors)
  invalid_rows = integer(row["invalid_review_signal_rows"], "invalid_review_signal_rows", slug, errors)

  if row["locked_pool_status"] == "locked_google_nifty_yahoo"
    expected_sum = [google, nifty, yahoo].compact.sum
    errors << "#{slug}: locked_pool_sum #{locked_sum.inspect} != #{expected_sum}" unless locked_sum == expected_sum
  elsif row["locked_pool_status"].to_s.start_with?("not_locked") && locked_sum
    errors << "#{slug}: not-locked decision scope must not have locked_pool_sum"
  end

  errors << "#{slug}: full_body_direct_reviews exceeds ledger_rows" if full_body && ledger_rows && full_body > ledger_rows
  errors << "#{slug}: facility_related_direct_reviews exceeds ledger_rows" if facility_related && ledger_rows && facility_related > ledger_rows

  if [dayuse, late_use, lodging, facility_related].all?
    scoped_total = dayuse + late_use + lodging
    errors << "#{slug}: scoped review total #{scoped_total} != facility_related_direct_reviews #{facility_related}" unless scoped_total == facility_related
  end

  if full_body
    strict_grade = expected_grade(full_body)
    errors << "#{slug}: evidence_grade #{row['evidence_grade']} must be #{strict_grade} for #{full_body} full-body reviews" unless row["evidence_grade"] == strict_grade
  end

  if row["evidence_grade"] == "A" && direct_platforms && direct_platforms < 3
    errors << "#{slug}: A evidence requires at least 3 direct-body platforms"
  elsif row["evidence_grade"] == "B" && direct_platforms && direct_platforms < 2
    errors << "#{slug}: B evidence requires at least 2 direct-body platforms"
  end

  %w[latest_stratum_seen low_rating_stratum_seen].each do |field|
    errors << "#{slug}: #{field} must be true or false" unless %w[true false].include?(row[field])
  end

  if %w[A B].include?(row["evidence_grade"])
    errors << "#{slug}: A/B evidence requires latest_stratum_seen=true" unless row["latest_stratum_seen"] == "true"
    errors << "#{slug}: A/B evidence requires low_rating_stratum_seen=true" unless row["low_rating_stratum_seen"] == "true"
  end

  errors << "#{slug}: official_water_profile_status is blank" if row["official_water_profile_status"].to_s.strip.empty?
  errors << "#{slug}: review_signal_contract_status is blank" if row["review_signal_contract_status"].to_s.strip.empty?
  errors << "#{slug}: forbidden_review_signal_rows must be 0" unless forbidden_rows == 0
  errors << "#{slug}: legacy_water_method_fields must be 0" unless legacy_fields == 0
  errors << "#{slug}: invalid_review_signal_rows must be 0" unless invalid_rows == 0
  errors << "#{slug}: forbidden_review_tags must be [] or blank" unless ["", "[]"].include?(row["forbidden_review_tags"].to_s.strip)

  if row["p0_decision"].to_s.start_with?("P0_ready") && !%w[A B].include?(row["evidence_grade"])
    errors << "#{slug}: P0_ready requires A or B evidence"
  end

  artifact_directory = row["artifact_directory"].to_s.strip
  if artifact_directory.empty?
    errors << "#{slug}: artifact_directory is blank"
    next
  end

  artifact_path = research_root.join(artifact_directory).cleanpath
  unless artifact_path.directory?
    errors << "#{slug}: artifact directory not found: #{artifact_path}"
    next
  end

  found = {}
  ARTIFACT_PATTERNS.each do |label, pattern|
    matches = artifact_path.glob(pattern)
    if matches.size != 1
      errors << "#{slug}: expected one #{label}, found #{matches.size}"
    else
      found[label] = matches.first
    end
  end

  ledger_matches = artifact_path.glob("*_direct_review_sample_index_*.csv")
  integrated_ledgers = ledger_matches.select { |path| path.basename.to_s.include?("_integrated_") }
  selected_ledgers = integrated_ledgers.empty? ? ledger_matches : integrated_ledgers
  if selected_ledgers.size != 1
    errors << "#{slug}: expected one canonical direct review ledger CSV, found #{selected_ledgers.size}"
  else
    found["direct review ledger CSV"] = selected_ledgers.first
  end

  begin
    JSON.parse(found.fetch("platform mapping JSON").read) if found["platform mapping JSON"]
  rescue JSON::ParserError => error
    errors << "#{slug}: invalid platform mapping JSON: #{error.message}"
  end

  if found["direct review ledger CSV"]
    direct_rows = CSV.read(found["direct review ledger CSV"], headers: true)
    errors << "#{slug}: ledger_rows #{ledger_rows} != CSV rows #{direct_rows.size}" unless ledger_rows == direct_rows.size

    %w[review_id dedupe_key content_type direct_body_status review_count_eligible facility_related scope_bucket platform language].each do |field|
      errors << "#{slug}: canonical ledger missing #{field}" unless direct_rows.headers.include?(field)
    end

    %w[review_id dedupe_key].each do |field|
      next unless direct_rows.headers.include?(field)

      values = direct_rows.map { |direct_row| direct_row[field].to_s.strip }
      errors << "#{slug}: canonical ledger has blank #{field}" if values.any?(&:empty?)
      errors << "#{slug}: canonical ledger has duplicate #{field}" unless values.uniq.size == values.size
    end

    eligible_rows = direct_rows.select { |direct_row| truthy?(direct_row["review_count_eligible"]) }
    errors << "#{slug}: full_body_direct_reviews #{full_body} != eligible ledger rows #{eligible_rows.size}" unless full_body == eligible_rows.size
    errors << "#{slug}: facility_related_direct_reviews #{facility_related} != eligible ledger rows #{eligible_rows.size}" unless facility_related == eligible_rows.size

    eligible_rows.each do |direct_row|
      errors << "#{slug}: eligible row #{direct_row['review_id']} is not a platform_review" unless direct_row["content_type"] == "platform_review"
      errors << "#{slug}: eligible row #{direct_row['review_id']} is not full body" unless direct_row["direct_body_status"] == "full"
      errors << "#{slug}: eligible row #{direct_row['review_id']} is not facility_related" unless truthy?(direct_row["facility_related"])
    end

    direct_rows.each do |direct_row|
      review_id = direct_row["review_id"]
      errors << "#{slug}: row #{review_id} has non-standard content_type #{direct_row['content_type'].inspect}" unless %w[platform_review blog_context activity_post snippet].include?(direct_row["content_type"])
      errors << "#{slug}: row #{review_id} has non-standard direct_body_status #{direct_row['direct_body_status'].inspect}" unless %w[full partial not_available].include?(direct_row["direct_body_status"])
      %w[review_count_eligible facility_related].each do |field|
        errors << "#{slug}: row #{review_id} has non-standard #{field} #{direct_row[field].inspect}" unless %w[true false].include?(direct_row[field])
      end
      errors << "#{slug}: row #{review_id} has non-canonical platform #{direct_row['platform'].inspect}" unless direct_row["platform"].to_s.match?(/\A[a-z0-9_]+\z/)
      errors << "#{slug}: row #{review_id} has non-canonical scope_bucket #{direct_row['scope_bucket'].inspect}" unless direct_row["scope_bucket"].to_s.match?(/\A[a-z0-9_]+\z/)
    end

    reproduced_platforms = eligible_rows.map { |direct_row| direct_row["platform"].to_s.strip }.reject(&:empty?).uniq.size
    errors << "#{slug}: direct_body_platform_count #{direct_platforms} != eligible ledger platforms #{reproduced_platforms}" unless direct_platforms == reproduced_platforms

    reproduced_korean = eligible_rows.count do |direct_row|
      direct_row["language"].to_s.strip.downcase.tr("-", "_").match?(/\A(?:ko|ko_kr|korean|한국어)\z/)
    end
    errors << "#{slug}: korean_full_body_direct_reviews #{korean_full_body} != eligible Korean ledger rows #{reproduced_korean}" unless korean_full_body == reproduced_korean

    reproduced_partial = direct_rows.count { |direct_row| direct_row["direct_body_status"] == "partial" }
    errors << "#{slug}: partial_review_rows_excluded #{partial_excluded} != ledger partial rows #{reproduced_partial}" unless partial_excluded == reproduced_partial

    reproduced_korean_context = direct_rows.count do |direct_row|
      korean = direct_row["language"].to_s.strip.downcase.tr("-", "_").match?(/\A(?:ko|ko_kr|korean|한국어)\z/)
      korean && direct_row["direct_body_status"] == "full" && !truthy?(direct_row["review_count_eligible"])
    end
    errors << "#{slug}: korean_context_bodies_excluded #{korean_context_excluded} != non-eligible Korean full-body rows #{reproduced_korean_context}" unless korean_context_excluded == reproduced_korean_context

    reproduced_dayuse = eligible_rows.count { |direct_row| direct_row["scope_bucket"] == "dayuse_only" }
    reproduced_lodging = eligible_rows.count { |direct_row| direct_row["scope_bucket"] == "lodging_bath_only" }
    reproduced_late = eligible_rows.count { |direct_row| %w[late_hour_facility_use airport_facility_use late_hour_or_airport_facility_use].include?(direct_row["scope_bucket"]) }
    errors << "#{slug}: dayuse_only_direct_reviews #{dayuse} != eligible ledger dayuse rows #{reproduced_dayuse}" unless dayuse == reproduced_dayuse
    errors << "#{slug}: lodging_bath_only_direct_reviews #{lodging} != eligible ledger lodging rows #{reproduced_lodging}" unless lodging == reproduced_lodging
    errors << "#{slug}: late_hour_or_airport_facility_use_reviews #{late_use} != eligible ledger late/airport rows #{reproduced_late}" unless late_use == reproduced_late

    reproduced_latest = eligible_rows.any? { |direct_row| stratum_seen?(direct_row, "latest") }
    reproduced_low = eligible_rows.any? { |direct_row| stratum_seen?(direct_row, "low_rating") }
    errors << "#{slug}: latest_stratum_seen #{row['latest_stratum_seen']} != ledger #{reproduced_latest}" unless row["latest_stratum_seen"] == reproduced_latest.to_s
    errors << "#{slug}: low_rating_stratum_seen #{row['low_rating_stratum_seen']} != ledger #{reproduced_low}" unless row["low_rating_stratum_seen"] == reproduced_low.to_s
  end

  if found["review signal CSV"]
    signal_rows = CSV.read(found["review signal CSV"], headers: true)
    %w[facility_slug signal_type source_count platform_count platforms water_texture_subtype color_tag publishable_item].each do |field|
      errors << "#{slug}: review signal CSV missing #{field}" unless signal_rows.headers.include?(field)
    end

    source_flow_rows = signal_rows.count { |signal_row| signal_row["signal_type"] == "source_flow_claim" }
    errors << "#{slug}: review signal CSV contains #{source_flow_rows} source_flow_claim rows" unless source_flow_rows.zero?

    signal_keys = []
    signal_rows.each do |signal_row|
      errors << "#{slug}: signal row facility_slug #{signal_row['facility_slug'].inspect} does not match" unless signal_row["facility_slug"] == slug
      source_count = integer(signal_row["source_count"], "signal source_count", slug, errors)
      platform_count = integer(signal_row["platform_count"], "signal platform_count", slug, errors)
      errors << "#{slug}: signal #{signal_row['signal_type']} source_count exceeds denominator" if source_count && full_body && source_count > full_body

      listed_platforms = signal_row["platforms"].to_s.split("|").map(&:strip).reject(&:empty?).uniq
      errors << "#{slug}: signal #{signal_row['signal_type']} platform_count #{platform_count} != listed platforms #{listed_platforms.size}" unless platform_count == listed_platforms.size

      color_tag = signal_row["color_tag"].to_s.strip
      errors << "#{slug}: signal #{signal_row['signal_type']} has invalid color_tag #{color_tag.inspect}" unless %w[white brown clear green other unclear not_applicable].include?(color_tag)
      errors << "#{slug}: signal #{signal_row['signal_type']} has invalid signal_direction #{signal_row['signal_direction'].inspect}" unless %w[positive negative mixed neutral].include?(signal_row["signal_direction"])
      errors << "#{slug}: signal #{signal_row['signal_type']} has invalid contradiction_level #{signal_row['contradiction_level'].inspect}" unless %w[low medium high].include?(signal_row["contradiction_level"])
      errors << "#{slug}: signal #{signal_row['signal_type']} has invalid review_signal_status #{signal_row['review_signal_status'].inspect}" unless %w[strong_signal moderate_signal weak_signal conflicting insufficient].include?(signal_row["review_signal_status"])

      texture_subtype = signal_row["water_texture_subtype"].to_s.strip
      if signal_row["signal_type"] == "water_texture"
        errors << "#{slug}: water_texture must have one explicit subtype, got #{texture_subtype.inspect}" unless %w[slippery salt_warmth sulfur carbonated].include?(texture_subtype)
        errors << "#{slug}: water_texture must not carry review color #{color_tag.inspect}" unless %w[unclear not_applicable].include?(color_tag)
      elsif !["", "not_applicable"].include?(texture_subtype)
        errors << "#{slug}: non-water signal #{signal_row['signal_type']} has invalid water_texture_subtype #{texture_subtype.inspect}"
      end

      signal_key = [signal_row["facility_area"], signal_row["signal_type"], texture_subtype, color_tag]
      errors << "#{slug}: duplicate signal key #{signal_key.join('/')}" if signal_keys.include?(signal_key)
      signal_keys << signal_key
    end

    publishable_rows = signal_rows.select { |signal_row| truthy?(signal_row["publishable_item"]) }
    publishable_rows.each do |signal_row|
      source_count = integer(signal_row["source_count"], "signal source_count", slug, errors)
      platform_count = integer(signal_row["platform_count"], "signal platform_count", slug, errors)
      floor = row["p0_decision"] == "full" ? 10 : 5
      errors << "#{slug}: publishable #{signal_row['signal_type']} source_count #{source_count} is below #{floor}" if source_count && source_count < floor
      errors << "#{slug}: publishable #{signal_row['signal_type']} has fewer than 2 platforms" if platform_count && platform_count < 2
      errors << "#{slug}: publishable #{signal_row['signal_type']} is below 2% of denominator" if source_count && full_body&.positive? && source_count.fdiv(full_body) < 0.02
    end

    if row["p0_decision"] == "full"
      errors << "#{slug}: full decision requires at least 300 eligible reviews" unless full_body && full_body >= 300
      errors << "#{slug}: full decision requires at least 3 direct-body platforms" unless direct_platforms && direct_platforms >= 3
      errors << "#{slug}: full decision requires at least 3 publishable signal rows" if publishable_rows.size < 3
    elsif row["p0_decision"] == "lite"
      errors << "#{slug}: lite decision requires at least 50 eligible reviews" unless full_body && full_body >= 50
      errors << "#{slug}: lite decision requires at least 2 direct-body platforms" unless direct_platforms && direct_platforms >= 2
      errors << "#{slug}: lite decision requires at least 2 publishable signal rows" if publishable_rows.size < 2
    elsif row["p0_decision"] == "draft"
      errors << "#{slug}: draft decision must not expose publishable signal rows" unless publishable_rows.empty?
    end
  end
rescue CSV::MalformedCSVError => error
  errors << "#{slug}: malformed CSV: #{error.message}"
end

if errors.empty?
  puts "OK: #{rows.size} candidates passed regional pipeline QA"
  exit 0
end

warn "FAILED: #{errors.size} validation error(s)"
errors.each { |error| warn "- #{error}" }
exit 1
