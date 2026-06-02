package com.example.lab3

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.lab3.models.Post
import com.example.lab3.models.User

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val viewModel: MainViewModel = viewModel()
                    SocialApp(viewModel)
                }
            }
        }
    }
}

@Composable
fun SocialApp(viewModel: MainViewModel) {
    val currentUser by viewModel.currentUser.collectAsState()

    if (currentUser == null) {
        AuthScreen(viewModel)
    } else {
        MainScreen(viewModel, currentUser!!)
    }
}

@Composable
fun AuthScreen(viewModel: MainViewModel) {
    var isLoginMode by remember { mutableStateOf(true) }
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val errorMessage by viewModel.errorMessage.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = if (isLoginMode) "Вхід" else "Реєстрація",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = username,
            onValueChange = { username = it },
            label = { Text("Логін") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Пароль") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))

        if (errorMessage != null) {
            Text(text = errorMessage!!, color = MaterialTheme.colorScheme.error)
            Spacer(modifier = Modifier.height(8.dp))
        }

        Button(
            onClick = {
                if (isLoginMode) viewModel.login(username, password)
                else viewModel.register(username, password)
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (isLoginMode) "Увійти" else "Зареєструватися")
        }

        TextButton(onClick = {
            isLoginMode = !isLoginMode
            viewModel.clearError()
        }) {
            Text(if (isLoginMode) "Немає акаунту? Реєстрація" else "Вже є акаунт? Увійти")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(viewModel: MainViewModel, currentUser: User) {
    var currentTab by remember { mutableStateOf("feed") }
    var activeChatUser by remember { mutableStateOf<String?>(null) }
    var searchQuery by remember { mutableStateOf("") }

    val searchResults by viewModel.searchResults.collectAsState()

    if (activeChatUser != null) {
        BackHandler { activeChatUser = null }
        ChatScreen(
            chatUser = activeChatUser!!,
            viewModel = viewModel,
            onBack = { activeChatUser = null }
        )
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (searchResults == null) "Студентська Мережа" else "Пошук...") },
                actions = {
                    IconButton(onClick = { viewModel.logout() }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Вийти")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Стрічка") },
                    label = { Text("Стрічка") },
                    selected = currentTab == "feed",
                    onClick = { currentTab = "feed" }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Person, contentDescription = "Люди") },
                    label = { Text("Люди") },
                    selected = currentTab == "users",
                    onClick = { currentTab = "users" }
                )
            }
        }
    ) { paddingValues ->
        Column(modifier = Modifier.padding(paddingValues)) {

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Пошук...") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(onClick = { viewModel.search(searchQuery) }) { Text("Знайти") }
                if (searchResults != null) {
                    IconButton(onClick = {
                        searchQuery = ""
                        viewModel.clearSearch()
                    }) {
                        Icon(Icons.Default.Clear, contentDescription = "Скинути")
                    }
                }
            }

            if (currentTab == "feed") {
                val posts = searchResults?.posts ?: viewModel.posts.collectAsState().value
                FeedContent(viewModel, posts)
            } else {
                val users = searchResults?.users ?: viewModel.users.collectAsState().value
                UsersContent(viewModel, currentUser, users, onOpenChat = { activeChatUser = it })
            }
        }
    }
}

@Composable
fun FeedContent(viewModel: MainViewModel, posts: List<Post>) {
    var newPostText by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize()) {
        Card(modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)) {
            Row(
                modifier = Modifier.padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = newPostText,
                    onValueChange = { newPostText = it },
                    placeholder = { Text("Що нового?") },
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(onClick = {
                    if (newPostText.isNotBlank()) {
                        viewModel.createPost(newPostText)
                        newPostText = ""
                    }
                }) { Text(Icons.Default.Send.name.take(0) + "Ok") }
            }
        }


        LazyColumn {
            items(posts) { post ->
                PostCard(post, viewModel)
            }
        }
    }
}

@Composable
fun PostCard(post: Post, viewModel: MainViewModel) {
    var commentText by remember { mutableStateOf("") }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 4.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(text = post.author, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = post.text, style = MaterialTheme.typography.bodyLarge)

            Spacer(modifier = Modifier.height(8.dp))
            Divider()
            Spacer(modifier = Modifier.height(4.dp))


            if (post.comments.isNotEmpty()) {
                Text("Коментарі:", style = MaterialTheme.typography.labelMedium)
                post.comments.forEach { comment ->
                    Text(
                        text = "${comment.author}: ${comment.text}",
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(vertical = 2.dp)
                    )
                }
            }


            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp)) {
                OutlinedTextField(
                    value = commentText,
                    onValueChange = { commentText = it },
                    placeholder = { Text("Коментар...") },
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Button(onClick = {
                    if (commentText.isNotBlank()) {
                        viewModel.addComment(post.id, commentText)
                        commentText = ""
                    }
                }) { Text("+") }
            }
        }
    }
}

@Composable
fun UsersContent(viewModel: MainViewModel, currentUser: User, users: List<User>, onOpenChat: (String) -> Unit) {
    LazyColumn(modifier = Modifier.fillMaxSize()) {
        items(users) { user ->
            val isMe = user.username == currentUser.username
            val isFriend = currentUser.friends.contains(user.username)

            Card(modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 4.dp)) {
                Row(
                    modifier = Modifier
                        .padding(16.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = user.username + if (isFriend) " 🌟" else "",
                        fontWeight = FontWeight.Bold
                    )
                    if (!isMe) {
                        Row {
                            if (!isFriend) {
                                TextButton(onClick = { viewModel.addFriend(user.username) }) {
                                    Text("+ Друг")
                                }
                            }
                            Button(onClick = { onOpenChat(user.username) }) {
                                Text("Чат")
                            }
                        }
                    } else {
                        Text("(Це ви)", color = Color.Gray)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(chatUser: String, viewModel: MainViewModel, onBack: () -> Unit) {
    val messages by viewModel.chatMessages.collectAsState()
    val currentUser = viewModel.currentUser.collectAsState().value?.username ?: ""
    var messageText by remember { mutableStateOf("") }

    LaunchedEffect(chatUser) {
        viewModel.loadMessages(chatUser)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Чат: $chatUser") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Назад")
                    }
                }
            )
        },
        bottomBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = messageText,
                    onValueChange = { messageText = it },
                    placeholder = { Text("Повідомлення...") },
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(onClick = {
                    if (messageText.isNotBlank()) {
                        viewModel.sendMessage(chatUser, messageText)
                        messageText = ""
                    }
                }) { Text("Send") }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            reverseLayout = false
        ) {
            items(messages) { msg ->
                val isMyMessage = msg.sender == currentUser
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = if (isMyMessage) Arrangement.End else Arrangement.Start
                ) {
                    Box(
                        modifier = Modifier
                            .background(
                                color = if (isMyMessage) MaterialTheme.colorScheme.primaryContainer
                                else MaterialTheme.colorScheme.surfaceVariant,
                                shape = MaterialTheme.shapes.medium
                            )
                            .padding(12.dp)
                    ) {
                        Text(text = msg.text, color = MaterialTheme.colorScheme.onSurface)
                    }
                }
            }
        }
    }
}