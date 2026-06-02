package com.example.lab3.network

import com.example.lab3.models.*
import retrofit2.http.*

interface SocialApi {

    @POST("/api/register")
    suspend fun register(@Body request: AuthRequest): User

    @POST("/api/login")
    suspend fun login(@Body request: AuthRequest): User

    @GET("/api/users")
    suspend fun getUsers(): List<User>

    @POST("/api/users/{username}/friends")
    suspend fun addFriend(
        @Path("username") username: String,
        @Body request: FriendRequest
    ): User

    @GET("/api/posts")
    suspend fun getPosts(): List<Post>

    @POST("/api/posts")
    suspend fun createPost(@Body request: PostRequest): Post

    @HTTP(method = "DELETE", path = "/api/posts/{id}", hasBody = true)
    suspend fun deletePost(
        @Path("id") id: Long,
        @Body request: ActionRequest
    ): SuccessResponse

    @PUT("/api/posts/{id}")
    suspend fun updatePost(
        @Path("id") id: Long,
        @Body request: UpdateTextRequest
    ): Post

    @POST("/api/posts/{id}/comments")
    suspend fun addComment(
        @Path("id") id: Long,
        @Body request: CommentRequest
    ): Post

    @HTTP(method = "DELETE", path = "/api/posts/{postId}/comments/{commentId}", hasBody = true)
    suspend fun deleteComment(
        @Path("postId") postId: Long,
        @Path("commentId") commentId: Long,
        @Body request: ActionRequest
    ): Post

    @PUT("/api/posts/{postId}/comments/{commentId}")
    suspend fun updateComment(
        @Path("postId") postId: Long,
        @Path("commentId") commentId: Long,
        @Body request: UpdateTextRequest
    ): Post

    @GET("/api/search")
    suspend fun search(@Query("q") query: String): SearchResponse

    @GET("/api/messages/{user1}/{user2}")
    suspend fun getMessages(
        @Path("user1") user1: String,
        @Path("user2") user2: String
    ): List<Message>

    @POST("/api/messages")
    suspend fun sendMessage(@Body request: MessageRequest): Message
}