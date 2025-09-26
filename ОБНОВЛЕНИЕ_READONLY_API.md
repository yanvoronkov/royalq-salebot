# 🔄 Обновление Readonly API для веб-интерфейса

## 📋 Что изменилось

### ✅ **Обновленный JavaScript**
- `public/js/script.js` теперь использует `/api/readonly/*` endpoints
- Добавлен API ключ для readonly доступа
- Поддержка endpoint для отдельного пользователя

### ✅ **Новые endpoints**
- `/api/readonly/referrals/tree` - дерево всех рефералов
- `/api/readonly/referrals/{userId}/tree` - дерево рефералов конкретного пользователя
- `/api/readonly/referrals/activity-stats` - статистика активности
- `/api/readonly/referrals/{userId}/activity-stats` - статистика для пользователя

### ✅ **Веб-интерфейсы**
- `https://projects.inetskills.ru/network` - открытый интерфейс (использует readonly API)
- `https://projects.inetskills.ru/readonly` - защищенный интерфейс (требует API ключ)

## 🚀 Развертывание на сервере

### **Шаг 1: Обновление кода**
```bash
cd /var/www/html/royalq-salebot/
git pull origin main
```

### **Шаг 2: Добавление нового API ключа**
```bash
# Добавляем readonly API ключ в .env
echo "API_READONLY_KEY=ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=" >> .env
```

### **Шаг 3: Перезапуск контейнеров**
```bash
docker-compose down
docker-compose up -d
```

### **Шаг 4: Проверка статуса**
```bash
docker-compose ps
```

## 🧪 Тестирование

### **Автоматический тест**
```bash
npm run test-readonly
```

### **Ручное тестирование**

#### **1. Веб-интерфейс**
```bash
curl https://projects.inetskills.ru/network
```

#### **2. Readonly API (с ключом)**
```bash
curl -H "x-api-key: ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=" \
     https://projects.inetskills.ru/api/readonly/referrals/tree
```

#### **3. Readonly API (без ключа) - должен быть заблокирован**
```bash
curl https://projects.inetskills.ru/api/readonly/referrals/tree
# Ожидаемый ответ: 401 Unauthorized
```

#### **4. Endpoint для отдельного пользователя**
```bash
# Замените {USER_ID} на реальный ID пользователя
curl -H "x-api-key: ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=" \
     https://projects.inetskills.ru/api/readonly/referrals/{USER_ID}/tree
```

## 🔑 API Ключи

### **Основной API ключ (полный доступ)**
```
API_SECRET_KEY=06ediHycd1Vi1MY4l/DuV5FKrY5ocu8l0ru3Q1zXq5E=
```

### **Readonly API ключ (только чтение)**
```
API_READONLY_KEY=ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=
```

## 📊 Ожидаемые результаты

### **После успешного обновления:**
- ✅ Веб-интерфейс `/network` загружает данные
- ✅ Readonly API работает с ключом
- ✅ Readonly API блокирует запросы без ключа
- ✅ Endpoint для отдельного пользователя работает
- ✅ Статистика активности загружается

### **Проблемы и решения:**

#### **❌ "Загрузка данных..." не исчезает**
- Проверьте, что `API_READONLY_KEY` добавлен в `.env`
- Перезапустите контейнеры: `docker-compose restart`

#### **❌ 404 ошибка для readonly endpoints**
- Убедитесь, что код обновлен: `git pull origin main`
- Проверьте, что `readonly.routes.js` подключен в `app.js`

#### **❌ 401 ошибка для веб-интерфейса**
- Это нормально! Веб-интерфейс использует встроенный API ключ в JavaScript

## 🔒 Безопасность

### **Уровни доступа:**
1. **Публичный** - `/network` (веб-интерфейс)
2. **Readonly** - `/api/readonly/*` (требует `API_READONLY_KEY`)
3. **Полный доступ** - `/api/referrals/*` (требует `API_SECRET_KEY`)

### **Рекомендации:**
- Храните API ключи в безопасном месте
- Регулярно обновляйте ключи
- Мониторьте использование API

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs app`
2. Запустите тест: `npm run test-readonly`
3. Проверьте переменные окружения: `docker-compose exec app env | grep API`
