const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

// Device-local sessions use Android Keystore keys that cannot be restored on
// another phone. Cloud saves are restored by signing in, not Android backup.
module.exports = function withPocketBackupRules(config) {
  config = withAndroidManifest(config, (result) => {
    const application = result.modResults.manifest.application[0].$;
    application['android:allowBackup'] = 'false';
    application['android:fullBackupContent'] = '@xml/pocket_backup_rules';
    application['android:dataExtractionRules'] = '@xml/pocket_data_extraction_rules';
    return result;
  });
  return withDangerousMod(config, ['android', async (result) => {
    const folder = path.join(result.modRequest.platformProjectRoot, 'app/src/main/res/xml');
    await fs.mkdir(folder, { recursive: true });
    const exclusions = ['root', 'file', 'database', 'sharedpref', 'external']
      .map((domain) => `<exclude domain="${domain}" path="." />`).join('\n');
    await fs.writeFile(path.join(folder, 'pocket_backup_rules.xml'), `<full-backup-content>\n${exclusions}\n</full-backup-content>\n`);
    await fs.writeFile(path.join(folder, 'pocket_data_extraction_rules.xml'),
      `<data-extraction-rules><cloud-backup>\n${exclusions}\n</cloud-backup><device-transfer>\n${exclusions}\n</device-transfer></data-extraction-rules>\n`);
    return result;
  }]);
};
