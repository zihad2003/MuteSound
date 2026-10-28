package app.mutesound.android

import android.Manifest
import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val channelName = "app.mutesound/mute"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channelName)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "requestPermissions" -> {
                        requestRuntimePermissions()
                        result.success(null)
                    }
                    "scheduleWindows" -> {
                        @Suppress("UNCHECKED_CAST")
                        val windows = call.argument<List<Map<String, Any>>>("windows") ?: emptyList()
                        MuteScheduler(this).scheduleWindows(windows)
                        result.success(null)
                    }
                    "cancelAll" -> {
                        MuteScheduler(this).cancelAll()
                        result.success(null)
                    }
                    "setMasterEnabled" -> {
                        val enabled = call.argument<Boolean>("enabled") ?: true
                        getSharedPreferences("mutesound", Context.MODE_PRIVATE)
                            .edit().putBoolean("master_enabled", enabled).apply()
                        if (!enabled) MuteScheduler(this).cancelAll()
                        result.success(null)
                    }
                    "undoMute" -> {
                        AudioController(this).restore()
                        stopService(Intent(this, MuteForegroundService::class.java))
                        result.success(null)
                    }
                    "snooze" -> {
                        val minutes = call.argument<Int>("minutes") ?: 10
                        MuteScheduler(this).snooze(minutes)
                        AudioController(this).restore()
                        result.success(null)
                    }
                    "status" -> {
                        val prefs = getSharedPreferences("mutesound", Context.MODE_PRIVATE)
                        result.success(
                            mapOf(
                                "masterEnabled" to prefs.getBoolean("master_enabled", true),
                                "muted" to prefs.getBoolean("currently_muted", false),
                            ),
                        )
                    }
                    else -> result.notImplemented()
                }
            }
    }

    private fun requestRuntimePermissions() {
        if (Build.VERSION.SDK_INT >= 33) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1001)
            }
        }
        if (Build.VERSION.SDK_INT >= 31) {
            val am = getSystemService(AlarmManager::class.java)
            if (am?.canScheduleExactAlarms() == false) {
                startActivity(Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM))
            }
        }
    }
}
