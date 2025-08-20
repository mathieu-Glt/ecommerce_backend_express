# 🏭 PATTERN FACTORY - SCHÉMA COMPLET

## 📊 **Diagramme du Pattern Factory**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Contrôleur)                              │
│                                                                             │
│  const userService = UserServiceFactory.createUserService('mongoose');     │
│  const result = await userService.findOrCreateUser(userData);              │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │ "Je veux un service utilisateur"
                      │
┌─────────────────────▼───────────────────────────────────────────────────────┐
│                        FACTORY                                             │
│                    UserServiceFactory                                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ createUserService(databaseType) {                                  │   │
│  │   switch (databaseType) {                                          │   │
│  │     case 'mongoose':                                               │   │
│  │       return createMongooseUserService();                          │   │
│  │     case 'mysql':                                                  │   │
│  │       return createMySQLUserService();                             │   │
│  │   }                                                                │   │
│  │ }                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ MONGOOSE    │ │   MYSQL     │ │    MOCK     │
│ FACTORY     │ │   FACTORY   │ │   FACTORY   │
└─────┬───────┘ └─────┬───────┘ └─────┬───────┘
      │               │               │
      ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│MongooseUser │ │MySQLUserRepo│ │MockUserRepo │
│Repository   │ │sitory       │ │sitory       │
└─────┬───────┘ └─────┬───────┘ └─────┬───────┘
      │               │               │
      ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│UserService  │ │UserService  │ │UserService  │
│(avec        │ │(avec        │ │(avec        │
│MongoDB)     │ │MySQL)       │ │Mock)        │
└─────────────┘ └─────────────┘ └─────────────┘
```

## 🔄 **Flux de création étape par étape**

### **Étape 1 : Demande du client**

```javascript
// Dans user.controllers.js
const userService = UserServiceFactory.createUserService("mongoose");
```

### **Étape 2 : Décision de la Factory**

```javascript
// Dans UserServiceFactory.js
static createUserService(databaseType = 'mongoose') {
  switch (databaseType.toLowerCase()) {
    case 'mongoose':
      return this.createMongooseUserService();  // ← Crée MongoDB
    case 'mysql':
      return this.createMySQLUserService();     // ← Crée MySQL
    default:
      return this.createMongooseUserService();  // ← Par défaut
  }
}
```

### **Étape 3 : Création du Repository**

```javascript
// Pour MongoDB
static createMongooseUserService() {
  const User = require('../models/User');
  const userRepository = new MongooseUserRepository(User);  // ← Repository MongoDB
  return new UserService(userRepository);                   // ← Service avec MongoDB
}

// Pour MySQL
static createMySQLUserService() {
  const mysql = require('mysql2/promise');
  const connection = mysql.createConnection({...});
  const userRepository = new MySQLUserRepository(connection); // ← Repository MySQL
  return new UserService(userRepository);                     // ← Service avec MySQL
}
```

## 🏗️ **Architecture détaillée**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONFIGURATION                                  │
│                                                                             │
│  .env file:                                                                 │
│  DATABASE_TYPE=mongoose  ← Détermine quelle DB utiliser                    │
│  MONGODB_URI=...                                                           │
│  DB_HOST=...                                                               │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │ process.env.DATABASE_TYPE
                      │
┌─────────────────────▼───────────────────────────────────────────────────────┐
│                           FACTORY PATTERN                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    UserServiceFactory                              │   │
│  │                                                                     │   │
│  │  + createUserService(databaseType)                                 │   │
│  │  + createMongooseUserService()                                     │   │
│  │  + createMySQLUserService()                                        │   │
│  │  + createMockUserService()                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  MONGODB    │ │   MYSQL     │ │    TEST     │
│  BRANCH     │ │   BRANCH    │ │   BRANCH    │
└─────┬───────┘ └─────┬───────┘ └─────┬───────┘
      │               │               │
      ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│MongooseUser │ │MySQLUserRepo│ │MockUserRepo │
│Repository   │ │sitory       │ │sitory       │
│             │ │             │ │             │
│+ findOrCreate│+ findOrCreate│+ findOrCreate│
│+ updateUser  │+ updateUser  │+ updateUser  │
│+ getUserByEmail│+ getUserByEmail│+ getUserByEmail│
└─────┬───────┘ └─────┬───────┘ └─────┬───────┘
      │               │               │
      ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│UserService  │ │UserService  │ │UserService  │
│(MongoDB)    │ │(MySQL)      │ │(Mock)       │
│             │ │             │ │             │
│+ findOrCreate│+ findOrCreate│+ findOrCreate│
│+ updateUser  │+ updateUser  │+ updateUser  │
│+ getUserProfile│+ getUserProfile│+ getUserProfile│
└─────────────┘ └─────────────┘ └─────────────┘
```

## 🎯 **Avantages du Pattern Factory**

### **1. 🔧 Configuration centralisée**

```javascript
// Un seul endroit pour configurer la DB
const userService = UserServiceFactory.createUserService(
  process.env.DATABASE_TYPE
);
```

### **2. 🔄 Flexibilité**

```javascript
// Changer de DB en une ligne
const userService = UserServiceFactory.createUserService("mysql"); // MySQL
const userService = UserServiceFactory.createUserService("mongoose"); // MongoDB
```

### **3. 🧪 Testabilité**

```javascript
// Tests avec mock
const userService = UserServiceFactory.createUserService("mock");
```

### **4. 🛡️ Encapsulation**

```javascript
// Le client ne sait pas comment le service est créé
const userService = UserServiceFactory.createUserService("mongoose");
// Il reçoit juste un service qui fonctionne
```

## 📋 **Comparaison : Avec vs Sans Factory**

### **❌ SANS Factory (ancien code)**

```javascript
// Dans chaque contrôleur
const User = require("../models/User");
const userService = new UserService(User);

// Problèmes :
// - Dépendance directe à Mongoose
// - Impossible de changer de DB
// - Code dupliqué
// - Difficile à tester
```

### **✅ AVEC Factory (nouveau code)**

```javascript
// Dans chaque contrôleur
const userService = UserServiceFactory.createUserService(
  process.env.DATABASE_TYPE
);

// Avantages :
// - Configuration centralisée
// - Changement de DB facile
// - Code réutilisable
// - Tests faciles
```

## 🔄 **Flux complet d'exécution**

```
1. 📝 Configuration
   .env → DATABASE_TYPE=mongoose

2. 🚀 Démarrage serveur
   server/index.js → lit DATABASE_TYPE

3. 🏭 Création Factory
   UserServiceFactory.createUserService('mongoose')

4. 🔧 Décision Factory
   switch('mongoose') → createMongooseUserService()

5. 📦 Création Repository
   new MongooseUserRepository(User)

6. 🎯 Création Service
   new UserService(mongooseRepository)

7. ✅ Service prêt
   userService.findOrCreateUser(userData)
```

## 🎨 **Pattern Factory en UML**

```
┌─────────────────┐         ┌─────────────────┐
│   Client        │────────▶│   Factory       │
│                 │         │                 │
│ + useService()  │         │ + createService()│
└─────────────────┘         └─────────────────┘
                                     │
                                     │ creates
                                     ▼
┌─────────────────┐         ┌─────────────────┐
│   Interface     │◀────────│   Concrete      │
│                 │         │   Service       │
│ + method1()     │         │                 │
│ + method2()     │         │ + method1()     │
└─────────────────┘         │ + method2()     │
                                     │
                                     │ uses
                                     ▼
┌─────────────────┐         ┌─────────────────┐
│   Repository    │◀────────│   Database      │
│   Interface     │         │                 │
│                 │         │ MongoDB/MySQL   │
│ + findUser()    │         │                 │
│ + saveUser()    │         │                 │
└─────────────────┘         └─────────────────┘
```

## 🚀 **Conclusion**

Le **Pattern Factory** est comme un **chef cuisinier intelligent** qui :

1. **🎯 Reçoit une commande** (type de DB)
2. **🔧 Choisit les ingrédients** (Repository approprié)
3. **👨‍🍳 Prépare le plat** (Service configuré)
4. **✅ Sert le résultat** (Service prêt à utiliser)

**Résultat :** Le client reçoit toujours un service qui fonctionne, peu importe la base de données utilisée ! 🎉


