package app.mutesound.android

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootCompletedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action != Intent.ACTION_BOOT_COMPLETED &&
            intent?.action != Intent.ACTION_LOCKED_BOOT_COMPLETED
        ) {
            return
        }
        val prefs = context.getSharedPreferences("mutesound", Context.MODE_PRIVATE)
        if (!prefs.getBoolean("master_enabled", true)) return
        MuteScheduler(context).rescheduleFromPrefs()
    }
}
