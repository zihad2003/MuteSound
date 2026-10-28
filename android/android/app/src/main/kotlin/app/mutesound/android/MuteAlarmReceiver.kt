package app.mutesound.android

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class MuteAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action ?: return
        val label = intent.getStringExtra("label") ?: "Prayer"
        when (action) {
            ACTION_MUTE -> {
                AudioController(context).mute()
                MuteForegroundService.start(context, "Muted for $label", true)
            }
            ACTION_RESTORE -> {
                AudioController(context).restore()
                MuteForegroundService.stop(context)
            }
        }
    }

    companion object {
        const val ACTION_MUTE = "app.mutesound.android.ACTION_MUTE"
        const val ACTION_RESTORE = "app.mutesound.android.ACTION_RESTORE"
    }
}
