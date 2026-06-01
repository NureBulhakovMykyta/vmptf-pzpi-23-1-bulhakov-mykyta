package com.example.pract3

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.io.File
import kotlin.math.pow

class Task34Activity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Calculator34Screen()
        }
    }
}

@Composable
fun Calculator34Screen() {
    val context = LocalContext.current
    val fileName = "calc_history.txt"

    var input1 by remember { mutableStateOf("") }
    var input2 by remember { mutableStateOf("") }
    var resultText by remember { mutableStateOf("Результат:") }
    var isRomanMode by remember { mutableStateOf(false) }
    var historyText by remember { mutableStateOf("") }
    var showHistory by remember { mutableStateOf(false) }

    fun saveToFile(operation: String, res: String) {
        val textToSave = "$operation = $res\n"
        try {
            context.openFileOutput(fileName, Context.MODE_APPEND).use {
                it.write(textToSave.toByteArray())
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun loadHistory() {
        try {
            val file = File(context.filesDir, fileName)
            if (file.exists()) {
                historyText = file.readText()
            } else {
                historyText = "Історія порожня"
            }
        } catch (e: Exception) {
            historyText = "Помилка читання файлу"
        }
    }

    fun calculate(operator: String) {
        if (isRomanMode) {
            val num1 = romanToInt(input1.uppercase())
            val num2 = romanToInt(input2.uppercase())

            if (num1 == -1 || num2 == -1) {
                resultText = "Помилка: Невірне римське число!"
                return
            }

            val res = when (operator) {
                "+" -> num1 + num2
                "-" -> num1 - num2
                "*" -> num1 * num2
                "/" -> if (num2 != 0) num1 / num2 else 0
                else -> 0
            }

            val romanRes = intToRoman(res)
            resultText = "Результат: $romanRes"
            saveToFile("$input1 $operator $input2 (Рим)", romanRes)

        } else {
            val num1 = input1.toDoubleOrNull()
            val num2 = input2.toDoubleOrNull()

            if (num1 != null && num2 != null) {
                val res = when (operator) {
                    "+" -> num1 + num2
                    "-" -> num1 - num2
                    "*" -> num1 * num2
                    "/" -> if (num2 != 0.0) num1 / num2 else "Ділення на 0!"
                    "^" -> num1.pow(num2)
                    "%" -> if (num2 != 0.0) num1 % num2 else "Ділення на 0!"
                    else -> 0.0
                }
                resultText = "Результат: $res"
                saveToFile("$input1 $operator $input2", res.toString())
            } else {
                resultText = "Помилка: Введіть числа!"
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Завдання 3-4: Калькулятор", fontSize = 22.sp, modifier = Modifier.padding(bottom = 16.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Десяткова")
            Switch(
                checked = isRomanMode,
                onCheckedChange = {
                    isRomanMode = it
                    input1 = ""
                    input2 = ""
                    resultText = "Результат:"
                },
                modifier = Modifier.padding(horizontal = 8.dp)
            )
            Text("Римська")
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = input1,
            onValueChange = { input1 = it },
            label = { Text(if (isRomanMode) "Перше число (напр. XIV)" else "Перше число") },
            keyboardOptions = if (isRomanMode) KeyboardOptions.Default else KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = input2,
            onValueChange = { input2 = it },
            label = { Text(if (isRomanMode) "Друге число (напр. V)" else "Друге число") },
            keyboardOptions = if (isRomanMode) KeyboardOptions.Default else KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(horizontalArrangement = Arrangement.SpaceEvenly, modifier = Modifier.fillMaxWidth()) {
            Button(onClick = { calculate("+") }) { Text("+") }
            Button(onClick = { calculate("-") }) { Text("-") }
            Button(onClick = { calculate("*") }) { Text("*") }
            Button(onClick = { calculate("/") }) { Text("/") }
        }

        if (!isRomanMode) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.SpaceEvenly, modifier = Modifier.fillMaxWidth()) {
                Button(onClick = { calculate("^") }) { Text("X^Y") }
                Button(onClick = { calculate("%") }) { Text("Mod (%)") }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text(text = resultText, fontSize = 20.sp, color = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                showHistory = !showHistory
                if (showHistory) loadHistory()
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (showHistory) "Сховати історію" else "Показати історію з файлу")
        }

        if (showHistory) {
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Text(
                    text = historyText,
                    modifier = Modifier.padding(16.dp),
                    fontSize = 16.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = {
                    File(context.filesDir, fileName).delete()
                    historyText = "Історія порожня"
                },
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
            ) {
                Text("Очистити файл історії")
            }
        }
    }
}

fun romanToInt(s: String): Int {
    val map = mapOf('I' to 1, 'V' to 5, 'X' to 10, 'L' to 50, 'C' to 100, 'D' to 500, 'M' to 1000)
    var res = 0
    var prev = 0
    for (i in s.length - 1 downTo 0) {
        val curr = map[s[i]] ?: return -1
        if (curr < prev) res -= curr else res += curr
        prev = curr
    }
    return res
}

fun intToRoman(num: Int): String {
    if (num <= 0) return "Неможливо (в римській немає 0 або від'ємних)"
    val values = intArrayOf(1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1)
    val symbols = arrayOf("M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I")
    var n = num
    val res = StringBuilder()
    for (i in values.indices) {
        while (n >= values[i]) {
            n -= values[i]
            res.append(symbols[i])
        }
    }
    return res.toString()
}