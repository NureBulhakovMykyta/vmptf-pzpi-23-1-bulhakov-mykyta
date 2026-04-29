from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('categories/', views.category_list, name='home'),
    path('comment/delete/<int:pk>/', views.delete_comment, name='delete_comment'),
    path('article/<int:pk>/', views.article_page, name='article_page'),
    path('article/delete/<int:pk>/', views.delete_article, name='delete_article'),
    path('article/edit/<int:pk>/', views.edit_article, name='edit_article'),
]