package com.example.lab3

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.lab3.models.*
import com.example.lab3.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {
    private val api = RetrofitClient.api

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser

    private val _posts = MutableStateFlow<List<Post>>(emptyList())
    val posts: StateFlow<List<Post>> = _posts

    private val _users = MutableStateFlow<List<User>>(emptyList())
    val users: StateFlow<List<User>> = _users

    private val _searchResults = MutableStateFlow<SearchResponse?>(null)
    val searchResults: StateFlow<SearchResponse?> = _searchResults

    private val _chatMessages = MutableStateFlow<List<Message>>(emptyList())
    val chatMessages: StateFlow<List<Message>> = _chatMessages

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage

    fun login(username: String, pass: String) {
        viewModelScope.launch {
            try {
                val user = api.login(AuthRequest(username, pass))
                _currentUser.value = user
                _errorMessage.value = null
                fetchInitialData()
            } catch (e: Exception) {
                _errorMessage.value = "Помилка: ${e.message}"
                e.printStackTrace()
            }
        }
    }

    fun register(username: String, pass: String) {
        viewModelScope.launch {
            try {
                val user = api.register(AuthRequest(username, pass))
                _currentUser.value = user
                _errorMessage.value = null
                fetchInitialData()
            } catch (e: Exception) {
                _errorMessage.value = "Помилка реєстрації. Можливо, користувач вже існує."
            }
        }
    }

    fun logout() {
        _currentUser.value = null
        _posts.value = emptyList()
        _users.value = emptyList()
        _searchResults.value = null
    }

    fun clearError() {
        _errorMessage.value = null
    }

    private fun fetchInitialData() {
        fetchPosts()
        fetchUsers()
    }

    fun fetchPosts() {
        viewModelScope.launch {
            try {
                _posts.value = api.getPosts()
            } catch (e: Exception) { e.printStackTrace() }
        }
    }

    fun fetchUsers() {
        viewModelScope.launch {
            try {
                val loadedUsers = api.getUsers()
                _users.value = loadedUsers

                _currentUser.value?.let { current ->
                    val updatedMe = loadedUsers.find { it.username == current.username }
                    if (updatedMe != null) _currentUser.value = updatedMe
                }
            } catch (e: Exception) { e.printStackTrace() }
        }
    }

    fun createPost(text: String) {
        val author = _currentUser.value?.username ?: return
        viewModelScope.launch {
            try {
                api.createPost(PostRequest(author, text))
                fetchPosts()
            } catch (e: Exception) { e.printStackTrace() }
        }
    }

    fun addComment(postId: Long, text: String) {
        val author = _currentUser.value?.username ?: return
        viewModelScope.launch {
            try {
                api.addComment(postId, CommentRequest(author, text))
                fetchPosts()
            } catch (e: Exception) { e.printStackTrace() }
        }
    }

    fun addFriend(friendName: String) {
        val me = _currentUser.value?.username ?: return
        viewModelScope.launch {
            try {
                api.addFriend(me, FriendRequest(friendName))
                fetchUsers()
            } catch (e: Exception) { e.printStackTrace() }
        }
    }

    fun search(query: String) {
        if (query.isBlank()) {
            _searchResults.value = null
            return
        }
        viewModelScope.launch {
            try {
                _searchResults.value = api.search(query)
            } catch (e: Exception) { e.printStackTrace() }
        }
    }

    fun clearSearch() {
        _searchResults.value = null
    }

    fun loadMessages(chatPartner: String) {
        val me = _currentUser.value?.username ?: return
        viewModelScope.launch {
            try {
                _chatMessages.value = api.getMessages(me, chatPartner)
            } catch (e: Exception) { e.printStackTrace() }
        }
    }

    fun sendMessage(receiver: String, text: String) {
        val me = _currentUser.value?.username ?: return
        viewModelScope.launch {
            try {
                api.sendMessage(MessageRequest(sender = me, receiver = receiver, text = text))
                loadMessages(receiver)
            } catch (e: Exception) { e.printStackTrace() }
        }
    }
}