package com.example.lab3.network

import com.example.lab3.models.*
import retrofit2.http.*

interface SocialApi {

    @Headers("Accept-Encoding: gzip")
    @POST("/api/register")
    suspend fun register(@Body request: AuthRequest): User

    @Headers("Accept-Encoding: gzip")
    @POST("/api/login")
    suspend fun login(@Body request: AuthRequest): User

    @Headers("Accept-Encoding: gzip")
    @GET("/api/users")
    suspend fun getUsers(): List<User>

    @Headers("Accept-Encoding: gzip")
    @POST("/api/users/{username}/friends")
    suspend fun addFriend(
        @Path("username") username: String,
        @Body request: FriendRequest
    ): User

    @Headers("Accept-Encoding: gzip")
    @GET("/api/posts")
    suspend fun getPosts(): List<Post>

    @Headers("Accept-Encoding: gzip")
    @POST("/api/posts")
    suspend fun createPost(@Body request: PostRequest): Post

    @Headers("Accept-Encoding: gzip")
    @HTTP(method = "DELETE", path = "/api/posts/{id}", hasBody = true)
    suspend fun deletePost(
        @Path("id") id: Long,
        @Body request: ActionRequest
    ): SuccessResponse

    @Headers("Accept-Encoding: gzip")
    @PUT("/api/posts/{id}")
    suspend fun updatePost(
        @Path("id") id: Long,
        @Body request: UpdateTextRequest
    ): Post

    @Headers("Accept-Encoding: gzip")
    @POST("/api/posts/{id}/comments")
    suspend fun addComment(
        @Path("id") id: Long,
        @Body request: CommentRequest
    ): Post

    @Headers("Accept-Encoding: gzip")
    @HTTP(method = "DELETE", path = "/api/posts/{postId}/comments/{commentId}", hasBody = true)
    suspend fun deleteComment(
        @Path("postId") postId: Long,
        @Path("commentId") commentId: Long,
        @Body request: ActionRequest
    ): Post

    @Headers("Accept-Encoding: gzip")
    @PUT("/api/posts/{postId}/comments/{commentId}")
    suspend fun updateComment(
        @Path("postId") postId: Long,
        @Path("commentId") commentId: Long,
        @Body request: UpdateTextRequest
    ): Post

    @Headers("Accept-Encoding: gzip")
    @GET("/api/search")
    suspend fun search(@Query("q") query: String): SearchResponse

    @Headers("Accept-Encoding: gzip")
    @GET("/api/messages/{user1}/{user2}")
    suspend fun getMessages(
        @Path("user1") user1: String,
        @Path("user2") user2: String
    ): List<Message>

    @Headers("Accept-Encoding: gzip")
    @POST("/api/messages")
    suspend fun sendMessage(@Body request: MessageRequest): Message
}