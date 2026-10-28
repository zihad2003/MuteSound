package app.mutesound.android

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

class MuteScheduler(private val context: Context) {
    private val prefs = context.getSharedPreferences("mutesound", Context.MODE_PRIVATE)
    private val alarms = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    fun scheduleWindows(windows: List<Map<String, Any>>) {
        cancelAll()
        val json = JSONArray()
        windows.forEachIndexed { index, w ->
            val id = (w["id"] as? String) ?: "p$index"
            val time = w["time"] as? String ?: return@forEachIndexed
            val duration = (w["durationMinutes"] as? Number)?.toInt() ?: 5
            val label = (w["label"] as? String) ?: id
            val parts = time.split(":")
            if (parts.size < 2) return@forEachIndexed
            val hour = parts[0].toIntOrNull() ?: return@forEachIndexed
            val minute = parts[1].toIntOrNull() ?: return@forEachIndexed

            val start = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                if (timeInMillis <= System.currentTimeMillis()) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }
            val end = (start.clone() as Calendar).apply { add(Calendar.MINUTE, duration) }

            setExact(reqCode(id, "start"), start.timeInMillis, MuteAlarmReceiver.ACTION_MUTE, id, label)
            setExact(reqCode(id, "end"), end.timeInMillis, MuteAlarmReceiver.ACTION_RESTORE, id, label)

            json.put(
                JSONObject()
                    .put("id", id)
                    .put("time", time)
                    .put("durationMinutes", duration)
                    .put("label", label),
            )
        }
        prefs.edit().putString("windows_json", json.toString()).apply()
    }

    fun rescheduleFromPrefs() {
        val raw = prefs.getString("windows_json", null) ?: return
        val arr = JSONArray(raw)
        val list = mutableListOf<Map<String, Any>>()
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            list.add(
                mapOf(
                    "id" to o.getString("id"),
                    "time" to o.getString("time"),
                    "durationMinutes" to o.getInt("durationMinutes"),
                    "label" to o.getString("label"),
                ),
            )
        }
        scheduleWindows(list)
    }

    fun snooze(minutes: Int) {
        val until = System.currentTimeMillis() + minutes * 60_000L
        setExact(9001, until, MuteAlarmReceiver.ACTION_MUTE, "snooze", "Snooze ended")
    }

    fun cancelAll() {
        val raw = prefs.getString("windows_json", "[]") ?: "[]"
        val arr = JSONArray(raw)
        for (i in 0 until arr.length()) {
            val id = arr.getJSONObject(i).getString("id")
            cancel(reqCode(id, "start"))
            cancel(reqCode(id, "end"))
        }
        cancel(9001)
    }

    private fun setExact(code: Int, at: Long, action: String, id: String, label: String) {
        val intent = Intent(context, MuteAlarmReceiver::class.java).apply {
            this.action = action
            putExtra("id", id)
            putExtra("label", label)
        }
        val pi = PendingIntent.getBroadcast(
            context,
            code,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        if (Build.VERSION.SDK_INT >= 23) {
            alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
        } else {
            alarms.setExact(AlarmManager.RTC_WAKEUP, at, pi)
        }
    }

    private fun cancel(code: Int) {
        val intent = Intent(context, MuteAlarmReceiver::class.java)
        val pi = PendingIntent.getBroadcast(
            context,
            code,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        alarms.cancel(pi)
    }

    private fun reqCode(id: String, kind: String): Int =
        ("$id:$kind").hashCode() and 0x7fffffff
}
