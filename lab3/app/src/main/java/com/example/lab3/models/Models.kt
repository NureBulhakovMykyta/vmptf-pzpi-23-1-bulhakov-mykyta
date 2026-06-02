package com.example.lab3.models

data class User(
    val id: Long,
    val username: String,
    val role: String? = "user",
    val friends: List<String>
)

data class Post(
    val id: Long,
    val author: String,
    val text: String,
    val likesCount: Int = 0,
    val comments: List<Comment> = emptyList()
)

data class Comment(
    val id: Long,
    val author: String,
    val text: String
)

data class Message(
    val id: Long,
    val sender: String,
    val receiver: String,
    val text: String
)

data class AuthRequest(
    val username: String,
    val password: String?
)

data class PostRequest(
    val author: String,
    val text: String
)

data class CommentRequest(
    val author: String,
    val text: String
)

data class MessageRequest(
    val sender: String,
    val receiver: String,
    val text: String
)

data class FriendRequest(
    val friendName: String
)

data class ActionRequest(
    val username: String
)

data class UpdateTextRequest(
    val username: String,
    val text: String
)

data class SearchResponse(
    val users: List<User>,
    val posts: List<Post>
)

data class SuccessResponse(
    val success: Boolean
)