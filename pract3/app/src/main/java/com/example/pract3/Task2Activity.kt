package com.example.pract3

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.random.Random

class Task2Activity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            GuessGameScreen()
        }
    }
}

@Composable
fun GuessGameScreen() {
    var targetNumber by remember { mutableIntStateOf(Random.nextInt(1, 101)) }
    var guessInput by remember { mutableStateOf("") }
    var feedbackText by remember { mutableStateOf("Загадано число від 1 до 100. Спробуй вгадати!") }
    var isGameWon by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = feedbackText, fontSize = 18.sp, fontWeight = FontWeight.Bold)

        Spacer(modifier = Modifier.height(24.dp))

        if (!isGameWon) {
            OutlinedTextField(
                value = guessInput,
                onValueChange = { guessInput = it },
                label = { Text("Твій варіант") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    val guess = guessInput.toIntOrNull()
                    if (guess != null) {
                        when {
                            guess > targetNumber -> feedbackText = "Забагато!"
                            guess < targetNumber -> feedbackText = "Замало!"
                            else -> {
                                feedbackText = "Число вгадано $targetNumber!"
                                isGameWon = true
                            }
                        }
                        guessInput = ""
                    } else {
                        feedbackText = "Будь ласка, введи число!"
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Перевірити")
            }
        } else {
            Button(
                onClick = {
                    targetNumber = Random.nextInt(1, 101)
                    feedbackText = "Я загадав число від 1 до 100. Спробуй вгадати!"
                    isGameWon = false
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Грати знову")
            }
        }
    }
}