package expo.modules.bathtimepocket

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class BathtimePocketModule : Module() {
  private fun store() = PocketStore(requireNotNull(appContext.reactContext))
  override fun definition() = ModuleDefinition {
    Name("BathtimePocket")
    Events("onOutboxChange")
    OnCreate { PocketStore.onChange = { sendEvent("onOutboxChange", emptyMap<String, Any>()) } }
    OnDestroy { PocketStore.onChange = null }
    AsyncFunction("configure") { url: String, apiKey: String -> store().configure(url, apiKey) }
    AsyncFunction("getEntries") { owner: String -> store().entries(owner) }
    AsyncFunction("enqueue") { url: String, title: String -> store().enqueue(url, title) }
    AsyncFunction("remove") { id: String -> store().remove(id) }
    AsyncFunction("retry") { PocketSyncWorker.schedule(requireNotNull(appContext.reactContext)) }
    AsyncFunction("authGet") { name: String -> store().authGet(name) }
    AsyncFunction("authSet") { name: String, value: String -> store().authSet(name, value) }
    AsyncFunction("authRemove") { name: String -> store().authRemove(name) }
  }
}
