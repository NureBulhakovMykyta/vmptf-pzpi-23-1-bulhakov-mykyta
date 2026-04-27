def task1(a, b, c):
    print(min(a, b, c))


def task2(test_string):
    return test_string[::-1]


def task3(palindrome_string):
    cleaned_str = palindrome_string.replace(" ", "").lower()
    return cleaned_str == cleaned_str[::-1]


def partition(array, low, high):
  pivot = array[high]
  i = low - 1

  for j in range(low, high):
    if array[j] <= pivot:
      i = i + 1
      (array[i], array[j]) = (array[j], array[i])

  (array[i + 1], array[high]) = (array[high], array[i + 1])
  return i + 1


def quick_sort(array, low, high):
  if low < high:
    pi = partition(array, low, high)
    quick_sort(array, low, pi - 1)
    quick_sort(array, pi + 1, high)


if __name__ == '__main__':
    task1(1353, 62, 334)
    print(task2("hello"))

    test_str = "аргентина манит негра"
    print(f"Is palindrome? {task3(test_str)}")

    data = [8, 7, 2, 1, 0, 9, 6]
    print("Unsorted array")
    print(data)
    quick_sort(data, 0, len(data) - 1)
    print('Sorted Array')
    print(data)