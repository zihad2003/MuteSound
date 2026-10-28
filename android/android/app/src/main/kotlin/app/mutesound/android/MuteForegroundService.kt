package app.mutesound.android

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder

class MuteForegroundService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_UNDO -> {
                AudioController(this).restore()
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_SNOOZE -> {
                MuteScheduler(this).snooze(10)
                AudioController(this).restore()
                stopSelf()
                return START_NOT_STICKY
            }
        }
        val text = intent?.getStringExtra("text") ?: "Mute window active"
        ensureChannel()
        val undo = PendingIntent.getService(
            this,
            1,
            Intent(this, MuteForegroundService::class.java).setAction(ACTION_UNDO),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val snooze = PendingIntent.getService(
            this,
            2,
            Intent(this, MuteForegroundService::class.java).setAction(ACTION_SNOOZE),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val builder = if (Build.VERSION.SDK_INT >= 26) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }
        val notification: Notification = builder
            .setContentTitle("MuteSound")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_lock_silent_mode)
            .setOngoing(true)
            .addAction(Notification.Action.Builder(null, "Undo", undo).build())
            .addAction(Notification.Action.Builder(null, "Snooze 10m", snooze).build())
            .build()
        startForeground(42, notification)
        return START_STICKY
    }

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < 26) return
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ID,
                "Mute windows",
                NotificationManager.IMPORTANCE_LOW,
            ),
        )
    }

    companion object {
        const val CHANNEL_ID = "mutesound_mute"
        const val ACTION_UNDO = "app.mutesound.android.UNDO"
        const val ACTION_SNOOZE = "app.mutesound.android.SNOOZE"

        fun start(context: Context, text: String, muted: Boolean) {
            val i = Intent(context, MuteForegroundService::class.java)
                .putExtra("text", text)
                .putExtra("muted", muted)
            if (Build.VERSION.SDK_INT >= 26) {
                context.startForegroundService(i)
            } else {
                context.startService(i)
            }
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, MuteForegroundService::class.java))
        }
    }
}
