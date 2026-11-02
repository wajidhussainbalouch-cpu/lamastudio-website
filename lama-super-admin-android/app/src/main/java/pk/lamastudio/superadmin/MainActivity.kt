package pk.lamastudio.superadmin

import android.app.Activity
import android.os.Bundle
import android.graphics.Color
import android.view.View
import android.widget.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class MainActivity : Activity() {
 private val endpoint = "https://script.google.com/macros/s/AKfycbz8Num29Df94i-TNlX4ggN6nveyVLpoPDo4feStMXV3DuAx-JoRD3nZH1Q90kVuEH57/exec"
 private lateinit var root: LinearLayout
 private var adminKey: String? = null
 override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); showLogin() }
 private fun base(title: String) {
  root=LinearLayout(this).apply { orientation=LinearLayout.VERTICAL; setPadding(28,42,28,20); setBackgroundColor(Color.rgb(247,249,246)) }
  val scroll=ScrollView(this).apply { addView(root) }; setContentView(scroll)
  label(title,24)
 }
 private fun label(text:String,size:Int=16) { root.addView(TextView(this).apply { this.text=text; textSize=size.toFloat(); setTextColor(Color.rgb(20,65,48)); setPadding(0,10,0,10) }) }
 private fun field(hint:String,secret:Boolean=false):EditText {
  val e=EditText(this).apply { this.hint=hint; setSingleLine(true); if(secret)inputType=129 }
  root.addView(e); return e
 }
 private fun button(name:String,action:()->Unit) { root.addView(Button(this).apply { text=name; setOnClickListener { action() } }) }
 private fun showLogin() {
  adminKey=null; base("LAMA Super Admin"); label("Private administration • Sign in with your existing Super Admin API credential.")
  val key=field("Super Admin API key",true)
  button("Connect securely") {
   val value=key.text.toString().trim()
   if(value.isEmpty()) { label("Enter your administrator credential."); return@button }
   // Validate credential before showing any protected management data.
   call("adminListSchools",JSONObject().put("adminApiKey",value)) { result ->
    if(result.optString("status")=="success") { adminKey=value; showDashboard(result) }
    else label("Access denied: "+result.optString("message","Check administrator credential."))
   }
  }
 }
 private fun showDashboard(result:JSONObject) {
  base("LAMA • Super Admin")
  label("Authenticated session (memory only). Credentials are not stored on this device.")
  button("Refresh schools") { request("adminListSchools") { showDashboard(it) } }
  val schools=result.optJSONArray("schools") ?: result.optJSONArray("records")
  if(schools==null) label("Connected. School list response: "+result.toString().take(1200))
  else for(i in 0 until schools.length()) {
   val school=schools.optJSONObject(i)?:continue
   label(school.optString("name","School")+" • "+school.optString("status",""),18)
  }
  button("Subscriptions") { request("adminListSchools") { label("School subscription data: "+it.toString().take(1800)) } }
  button("Sign out") { showLogin() }
 }
 private fun request(action:String,done:(JSONObject)->Unit) {
  val key=adminKey?:return showLogin()
  call(action,JSONObject().put("adminApiKey",key),done)
 }
 private fun call(action:String,body:JSONObject,done:(JSONObject)->Unit) {
  thread {
   val result=try {
    val connection=URL(endpoint).openConnection() as HttpURLConnection
    connection.requestMethod="POST"; connection.doOutput=true
    connection.connectTimeout=15000; connection.readTimeout=25000
    connection.setRequestProperty("Content-Type","text/plain;charset=utf-8")
    body.put("action",action)
    connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
    val text=connection.inputStream.bufferedReader().use { it.readText() }
    connection.disconnect(); JSONObject(text)
   } catch(e:Exception) { JSONObject().put("status","error").put("message",e.message?:"Network error") }
   runOnUiThread { done(result) }
  }
 }
}
