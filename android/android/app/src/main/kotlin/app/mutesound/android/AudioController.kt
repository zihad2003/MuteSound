package app.mutesound.android

import android.content.Context
import android.media.AudioManager

class AudioController(private val context: Context) {
    private val prefs = context.getSharedPreferences("mutesound", Context.MODE_PRIVATE)
    private val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    fun mute() {
        if (!prefs.getBoolean("master_enabled", true)) return
        if (!prefs.contains("saved_music_vol")) {
            prefs.edit()
                .putInt("saved_music_vol", audio.getStreamVolume(AudioManager.STREAM_MUSIC))
                .putBoolean("currently_muted", true)
                .apply()
        } else {
            prefs.edit().putBoolean("currently_muted", true).apply()
        }
        audio.adjustStreamVolume(
            AudioManager.STREAM_MUSIC,
            AudioManager.ADJUST_MUTE,
            0,
        )
        // Fallback for older APIs / OEMs that ignore ADJUST_MUTE
        audio.setStreamVolume(AudioManager.STREAM_MUSIC, 0, 0)
    }

    fun restore() {
        val saved = prefs.getInt("saved_music_vol", -1)
        audio.adjustStreamVolume(
            AudioManager.STREAM_MUSIC,
            AudioManager.ADJUST_UNMUTE,
            0,
        )
        if (saved >= 0) {
            audio.setStreamVolume(AudioManager.STREAM_MUSIC, saved, 0)
        }
        prefs.edit()
            .remove("saved_music_vol")
            .putBoolean("currently_muted", false)
            .apply()
    }
}
