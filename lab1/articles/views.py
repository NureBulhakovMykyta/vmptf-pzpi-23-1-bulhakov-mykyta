from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Count
from django.http import HttpResponseForbidden
from .forms import SignUpForm, ArticleForm
from .models import Category, Article, Comment
from django.contrib.auth import login
from django.contrib.auth.models import Group

def signup(request):
    if request.method == "POST":
        form = SignUpForm(request.POST)

        if form.is_valid():
            user = form.save()
            authors_group, created = Group.objects.get_or_create(name='Authors')
            user.groups.add(authors_group)

            login(request, user)
            return redirect('home')

    else:
        form = SignUpForm()

    return render(request, 'registration/signup.html', {'form': form})

def category_list(request):
    sort = request.GET.get('sort', '')

    categories = Category.objects.all().order_by('name')
    articles = Article.objects.all().order_by('title')

    if sort == 'date':
        articles = articles.order_by('-created')

    elif sort == 'comments':
        articles = articles.annotate(
            comments_count=Count('comment')
        ).order_by('-comments_count')

    context = {
        'categories': categories,
        'articles': articles,
        'current_sort': sort
    }

    return render(request, 'category-article_list.html', context)


def delete_comment(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    article = comment.article

    if request.user != article.author and not request.user.is_superuser:
        return HttpResponseForbidden("You cannot delete this comment")

    if request.method == "POST":
        comment.delete()

    return redirect('article_page', pk=article.id)


def delete_article(request, pk):
    article = get_object_or_404(Article, pk=pk)

    if request.user != article.author and not request.user.is_superuser:
        return HttpResponseForbidden("You are not allowed to delete this article")

    if request.method == "POST":
        article.delete()
        return redirect('home')

    return render(request, 'confirm_delete.html', {'article': article})


def edit_article(request, pk):
    article = get_object_or_404(Article, pk=pk)

    if request.user != article.author and not request.user.is_superuser:
        return HttpResponseForbidden("Forbidden")

    if request.method == "POST":
        form = ArticleForm(request.POST, instance=article)
        if form.is_valid():
            form.save()
            return redirect('article_page', pk=article.pk)
    else:
        form = ArticleForm(instance=article)

    return render(request, 'edit_article.html', {'form': form, 'article': article})


def article_page(request, pk):
    article = get_object_or_404(Article, pk=pk)

    comments = Comment.objects.filter(article=article).order_by('-created')

    return render(request, 'article_page.html', {
        'article': article,
        'comments': comments
    })
