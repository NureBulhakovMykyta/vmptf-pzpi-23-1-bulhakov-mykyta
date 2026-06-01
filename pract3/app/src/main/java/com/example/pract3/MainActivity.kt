package com.example.pract3

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.material3.Button
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MainMenuScreen()
        }
    }
}

@Composable
fun MainMenuScreen() {
    val context = LocalContext.current

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("ПЗ №3", fontSize = 24.sp, modifier = Modifier.padding(bottom = 32.dp))

        Button(
            onClick = {
                context.startActivity(Intent(context, Task1Activity::class.java))
            },
            modifier = Modifier.fillMaxWidth(0.7f).padding(bottom = 16.dp)
        ) {
            Text("1. Різниця чисел")
        }

        Button(
            onClick = {
                context.startActivity(Intent(context, Task2Activity::class.java))
            },
            modifier = Modifier.fillMaxWidth(0.7f)
        ) {
            Text("2. Гра «Вгадай число»")
        }

        Button(
            onClick = { context.startActivity(Intent(context, Task34Activity::class.java)) },
            modifier = Modifier.fillMaxWidth(0.7f).padding(top = 16.dp)
        ) {
            Text("3-4. Калькулятор")
        }
    }
}
