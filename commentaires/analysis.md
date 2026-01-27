# Analyse du Projet Microservices - Système de Gestion Scolaire (SMS)

## 📊 Vue d'ensemble

Ce projet est une **architecture microservices complète** pour un système de gestion scolaire (School Management System) développé en **Java 23** avec **Spring Boot 3.4.1** et **Spring Cloud 2024.0.0**.

### Caractéristiques principales
- ✅ **11 microservices** indépendants
- ✅ Architecture **événementielle** avec Apache Kafka
- ✅ **Service discovery** avec Eureka
- ✅ **API Gateway** centralisé
- ✅ **Configuration centralisée** (Config Server)
- ✅ Bases de données **PostgreSQL** séparées par service
- ✅ **Authentification JWT** avec Spring Security
- ✅ Code **sans Lombok** (code manuel)
- ✅ Pattern **CQRS** pour les rapports

---

## 🏗️ Architecture Globale

### Infrastructure (Dossier `infra/`)

#### 1. **Eureka Server** (Port: 8761)
- Service de découverte et registre de services
- Tous les microservices s'y enregistrent
- Permet la communication inter-services

#### 2. **API Gateway**
- Point d'entrée unique pour toutes les requêtes
- Routage vers les microservices appropriés
- Intégration avec le service d'authentification

#### 3. **Config Server**
- Configuration centralisée pour tous les services
- Gestion des propriétés par environnement
- Facilite la maintenance

#### 4. **Message Brokers** (docker-compose-broker.yml)
- **Apache Kafka** (Port: 9092) - Événements asynchrones
- **Zookeeper** (Port: 2181) - Coordination Kafka
- **RabbitMQ** (Port: 5672, Management: 15672) - Messaging alternatif

---

## 🎯 Microservices

### 1. **Identity Service** (Port: 8084)
**Responsabilité**: Authentification et gestion des identités

#### Technologies
- Spring Security avec JWT (jjwt 0.11.5)
- BCrypt (force 12) pour les mots de passe
- Spring Kafka pour événements

#### Architecture de Sécurité
```
HTTP Request
    ↓
JwtAuthenticationFilter (validation JWT)
    ↓
CustomUserDetailsService (chargement utilisateur)
    ↓
SecurityFilterChain (vérification rôles)
    ↓
Controller
    ↓
Response (ou 401 via JwtAuthenticationEntryPoint)
```

#### Composants clés
- **JwtAuthenticationFilter**: Filtre personnalisé pour validation JWT
- **CustomUserDetailsService**: Implémente `UserDetailsService`
- **JwtAuthenticationEntryPoint**: Gestion erreurs 401
- **SecurityConfig**: Configuration Spring Security

#### Base de données: `identity_db`
```sql
Table: users
- id (UUID)
- username (unique)
- email (unique)
- password_hash
- role (ADMIN, MANAGER, INSTRUCTOR, STUDENT)
- is_active
- timestamps
```

#### Endpoints
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion (retourne JWT)
- `POST /api/auth/validate` - Validation de token
- `GET /api/users` - Liste utilisateurs (Admin only)
- `PUT /api/users/{id}` - Mise à jour
- `DELETE /api/users/{id}` - Suppression (Admin only)

#### Événements Kafka
- **Topic**: `user-created` - Lors de la création d'un utilisateur
- **Topic**: `user-login` - Lors de la connexion

#### Points forts
✅ Architecture Spring Security complète
✅ JWT avec expiration (24h)
✅ Gestion des sessions STATELESS
✅ Role-based authorization
✅ Publication d'événements pour synchronisation

---

### 2. **Academic Structure Service** (Port: 8086)
**Responsabilité**: Gestion de la structure académique

#### Entités gérées
1. **Department** (Départements)
   - Unités organisationnelles (ex: Informatique, Mathématiques)
   - Relations avec classes, modules, instructeurs

2. **ClassGroup** (Classes)
   - Cohortes d'étudiants (L1, L2, L3, M1, M2)
   - Capacité, gestionnaire, niveau

3. **Module** (Modules d'enseignement)
   - Unités d'enseignement
   - Crédits ECTS, niveau, département

4. **Subject** (Matières)
   - Cours individuels dans un module
   - Coefficient, volume horaire

5. **SubjectOffering** (Offres de cours)
   - Planification concrète (enseignant, classe, salle, horaire)
   - Status: PLANNED, ONGOING, COMPLETED, CANCELLED

#### Base de données: `academic_structure_db`
- 5 tables liées avec contraintes de clés étrangères
- Index optimisés sur les relations

#### Pattern architectural
- Controller → Service → Repository
- DTOs pour toutes les opérations (Request/Response)
- Validation avec Jakarta Bean Validation
- Transactions avec `@Transactional`

---

### 3. **Attendance Service** (Port: 8086)
**Responsabilité**: Gestion des présences et absences

#### Workflow complet de validation

```
1. Instructeur enregistre
   ↓ (ABSENT → PENDING)
   Événement: STUDENT_ABSENT_PENDING

2. Étudiant soumet justification
   ↓
   Événement: JUSTIFICATION_SUBMITTED

3. Manager valide/rejette
   ↓ (VALIDATED ou REJECTED)
   Événement: ATTENDANCE_VALIDATED

4. Si REJECTED → Étudiant fait appel
   ↓ (APPEAL_PENDING)
   Événement: APPEAL_SUBMITTED

5. Manager/Admin examine appel
   ↓ (APPEAL_APPROVED ou APPEAL_DENIED)
   Événement: APPEAL_REVIEWED
```

#### Statuts de présence
- `PRESENT` - Présent
- `ABSENT` - Absent
- `LATE` - En retard
- `EXCUSED` - Absence excusée
- `SICK_LEAVE` - Congé maladie

#### Statuts de validation
- `PENDING` - En attente
- `VALIDATED` - Validé par manager
- `REJECTED` - Rejeté par manager

#### Statuts d'appel
- `NO_APPEAL` - Aucun appel
- `APPEAL_PENDING` - Appel en attente
- `APPEAL_APPROVED` - Appel approuvé
- `APPEAL_DENIED` - Appel refusé

#### Base de données: `attendance_db`
```sql
Table: attendance
- id, student_id, class_group_id, subject_id
- session_date, status, validation_status
- justification, justification_submitted_at
- recorded_by, validated_by
- appeal_reason, appeal_status
- appeal_reviewed_by, appeal_reviewed_at
- timestamps
```

#### Fonctionnalités clés
✅ Système de justification
✅ Validation hiérarchique (instructeur → manager)
✅ Système d'appel pour contestation
✅ Calcul du taux de présence
✅ Statistiques détaillées par étudiant/classe
✅ 6 types d'événements Kafka

---

### 4. **Academic Year Service** (Port: 8085)
**Responsabilité**: Gestion des années académiques et semestres

#### Base de données: `academic_year_db`
```sql
Table: academic_year
- id, year, start_date, end_date
- status (ACTIVE, COMPLETED, ARCHIVED)

Table: semester
- id, academic_year_id
- name, semester_number (1 ou 2)
- start_date, end_date
```

---

### 5. **Student Service** (Port: 8087)
**Responsabilité**: Gestion des étudiants

#### Base de données: `student_db`
```sql
Table: student
- id, user_id, student_number
- first_name, last_name, date_of_birth
- email, phone, address
- enrollment_date, status

Table: student_enrollment
- id, student_id, class_group_id
- academic_year_id, enrollment_date
- status
```

#### Statuts d'étudiant
- `ACTIVE` - Actif
- `INACTIVE` - Inactif
- `GRADUATED` - Diplômé
- `SUSPENDED` - Suspendu

---

### 6. **Instructor Service** (Port: 8088)
**Responsabilité**: Gestion des enseignants

#### Base de données: `instructor_db`
```sql
Table: instructor
- id, user_id, employee_number
- first_name, last_name, email, phone
- department_id, specialization
- hire_date, office_location, status
```

---

### 7. **Manager Service** (Port: 8095)
**Responsabilité**: Gestion des managers et leurs responsabilités

#### Niveaux de managers
- `HEAD_OF_DEPARTMENT` - Chef de département
- `ACADEMIC_DIRECTOR` - Directeur académique
- `PROGRAM_COORDINATOR` - Coordinateur de programme
- `YEAR_COORDINATOR` - Coordinateur d'année
- `QUALITY_ASSURANCE_MANAGER` - Gestionnaire qualité
- `STUDENT_AFFAIRS_MANAGER` - Gestionnaire affaires étudiantes

#### Base de données: `manager_db`
```sql
Table: managers
Table: manager_assignments (affectations)
Table: manager_responsibilities (responsabilités)
Table: manager_actions (audit des actions)
```

#### Types de responsabilités
- Validation de notes
- Approbation d'inscriptions
- Surveillance des présences
- Gestion des emplois du temps
- Approbation budgétaire
- Évaluation du personnel

---

### 8. **Admin Service** (Port: 8094)
**Responsabilité**: Administration système et audit

#### Base de données: `admin_db`
```sql
Table: audit_logs (logs d'audit)
Table: system_configs (configurations système)
Table: user_management_actions (actions de gestion)
Table: global_notifications (notifications globales)
Table: role_permissions (permissions par rôle)
```

#### Permissions par rôle (pré-configurées)
- **ADMIN**: Gestion complète
- **MANAGER**: Approbations et validation
- **INSTRUCTOR**: Gestion notes et présences
- **STUDENT**: Consultation uniquement

---

### 9. **Notification Service** (Port: 8092)
**Responsabilité**: Gestion des notifications

#### Base de données: `notification_db`
```sql
Table: notification
- id, user_id, type, title, message
- is_read, created_at, read_at
```

#### Intégration
- Écoute les événements Kafka
- Envoie notifications pour :
  - Création de compte
  - Connexion
  - Validation d'absence
  - Publication de notes
  - Appels

---

### 10. **Messaging Service** (Port: 8091)
**Responsabilité**: Messagerie interne

#### Base de données: `messaging_db`
```sql
Table: message
- id, sender_id, receiver_id
- subject, content
- is_read, sent_at, read_at
```

---

### 11. **Report Service** (Port: 8093)
**Responsabilité**: Rapports et statistiques (CQRS)

#### Pattern CQRS
- **Projections** en lecture seule
- Mises à jour via événements Kafka

#### Base de données: `report_db`
```sql
Table: student_report_projection
- student_id, student_name
- total_modules, average_grade
- attendance_rate, last_updated

Table: class_report_projection
- class_group_id, class_name
- total_students, average_grade
- average_attendance, last_updated
```

---

## 🔄 Communication Inter-Services

### 1. Synchrone (REST)
- Via **API Gateway**
- Service discovery avec **Eureka**
- Load balancing automatique

### 2. Asynchrone (Événements)
- **Apache Kafka** pour événements métier
- **RabbitMQ** optionnel (messaging)

### Topics Kafka identifiés
- `user-created` - Création utilisateur
- `user-login` - Connexion utilisateur
- `attendance-events` - Événements de présence
  - ATTENDANCE_RECORDED
  - STUDENT_ABSENT_PENDING
  - JUSTIFICATION_SUBMITTED
  - ATTENDANCE_VALIDATED
  - APPEAL_SUBMITTED
  - APPEAL_REVIEWED

---

## 💾 Base de Données

### Architecture
- **12 bases PostgreSQL** séparées (une par service)
- Isolation complète des données
- Relations via UUID (pas de clés étrangères inter-DB)

### Script d'initialisation
- `database/init-all-databases.sql` (590 lignes)
- Crée toutes les bases et tables
- Extensions UUID
- Index optimisés
- Contraintes CHECK
- Données de test (role_permissions)

### Migration
- `database/migrate-attendance-justification.sql`
- Migration pour le système de justification

---

## 🛠️ Stack Technique

### Backend
- **Java**: 23
- **Spring Boot**: 3.4.1
- **Spring Cloud**: 2024.0.0
- **Spring Data JPA**: Persistance
- **Spring Security**: Authentification/Autorisation
- **Spring Kafka**: Messaging
- **Maven**: 3.9+

### Base de données
- **PostgreSQL**: 14+
- Extension UUID-OSSP

### Messaging
- **Apache Kafka**: 3.x (Confluent Platform 7.5.0)
- **Zookeeper**: 7.5.0
- **RabbitMQ**: 3.13 (avec management UI)

### Infrastructure
- **Eureka Server**: Service discovery
- **Spring Cloud Gateway**: API Gateway
- **Spring Cloud Config**: Configuration centralisée

### Sécurité
- **JWT**: io.jsonwebtoken (jjwt) 0.11.5
- **BCrypt**: Force 12

---

## 📐 Patterns et Bonnes Pratiques

### Architecture
✅ **Microservices** - Services indépendants et déployables
✅ **CQRS** - Séparation lecture/écriture (Report Service)
✅ **Event Sourcing** - Publication d'événements métier
✅ **API Gateway** - Point d'entrée unique
✅ **Service Discovery** - Découverte automatique

### Code
✅ **Pas de Lombok** - Code manuel pour transparence
✅ **DTOs** - Séparation entités/API
✅ **Validation** - Jakarta Bean Validation
✅ **Transactions** - `@Transactional` approprié
✅ **Layered Architecture** - Controller → Service → Repository

### Sécurité
✅ **JWT Stateless** - Pas de session HTTP
✅ **BCrypt** - Hashing sécurisé (force 12)
✅ **Role-based Access** - ADMIN, MANAGER, INSTRUCTOR, STUDENT
✅ **Audit Trail** - Logs complets (admin_db, manager_db)

### Base de données
✅ **Database per Service** - Isolation complète
✅ **UUID** - Identifiants universels
✅ **Index** - Optimisation des requêtes
✅ **Constraints** - Intégrité des données

---

## 🔐 Sécurité

### Authentification
- JWT avec expiration (24h par défaut)
- Tokens signés avec HS256
- Format: `Authorization: Bearer {token}`

### Autorisation
- 4 rôles principaux: ADMIN, MANAGER, INSTRUCTOR, STUDENT
- Matrice de permissions dans `admin_db.role_permissions`
- `@PreAuthorize` pour contrôle fin

### Sécurité des données
- Mots de passe hashés avec BCrypt (force 12)
- Pas de stockage de mots de passe en clair
- Audit trail complet

### Recommandations
⚠️ **Changer `jwt.secret` en production** (clé 256 bits)
⚠️ **Utiliser HTTPS** en production
⚠️ **Rotation périodique** des secrets
⚠️ **Rate limiting** pour les tentatives de connexion

---

## 🚀 Déploiement

### Ordre de démarrage

1. **Infrastructure**
   ```bash
   # PostgreSQL
   # Kafka + Zookeeper
   cd infra
   docker-compose -f docker-compose-broker.yml up -d
   
   # Eureka Server (8761)
   cd eureka-server
   mvn spring-boot:run
   
   # Config Server
   cd config-server
   mvn spring-boot:run
   ```

2. **Core Services**
   ```bash
   # Identity Service (8084)
   cd services/identity-service
   mvn spring-boot:run
   
   # Academic Year Service (8085)
   # Academic Structure Service (8086)
   # ...
   ```

3. **API Gateway**
   ```bash
   cd infra/api-gateway
   mvn spring-boot:run
   ```

### Ports utilisés

| Service | Port |
|---------|------|
| Eureka Server | 8761 |
| API Gateway | 8080 |
| Config Server | 8888 |
| Identity | 8084 |
| Academic Year | 8085 |
| Academic Structure | 8086 |
| Student | 8087 |
| Instructor | 8088 |
| Attendance | 8090 |
| Messaging | 8091 |
| Notification | 8092 |
| Report | 8093 |
| Admin | 8094 |
| Manager | 8095 |
| Kafka | 9092 |
| Zookeeper | 2181 |
| RabbitMQ | 5672 |
| RabbitMQ Management | 15672 |

---

## 📊 Points Forts du Projet

### Architecture
✅ **Scalabilité** - Services indépendants
✅ **Résilience** - Isolation des défaillances
✅ **Maintenabilité** - Séparation des responsabilités
✅ **Évolutivité** - Ajout facile de nouveaux services

### Technique
✅ **Java 23** - Version moderne
✅ **Spring Boot 3.4.1** - Framework récent
✅ **Code propre** - Sans Lombok, lisible
✅ **Documentation** - README détaillé par service

### Sécurité
✅ **JWT moderne** - jjwt 0.11.5
✅ **Spring Security complet** - Architecture robuste
✅ **Audit trail** - Traçabilité complète
✅ **Role-based** - Permissions granulaires

### Workflow métier
✅ **Système de justification** - Attendance Service
✅ **Système d'appel** - Processus complet
✅ **Validation hiérarchique** - Instructeur → Manager
✅ **Événements métier** - Synchronisation asynchrone

---

## 🎯 Améliorations Potentielles

### Infrastructure
- [ ] **Docker Compose** complet pour tous les services
- [ ] **Kubernetes** pour orchestration
- [ ] **CI/CD** avec GitHub Actions ou GitLab CI
- [ ] **Monitoring** avec Prometheus + Grafana
- [ ] **Tracing** avec Zipkin ou Jaeger
- [ ] **Centralized Logging** avec ELK Stack

### Sécurité
- [ ] **Refresh Tokens** pour sessions longues
- [ ] **OAuth2** pour authentification externe
- [ ] **Rate Limiting** sur API Gateway
- [ ] **CORS** configuration avancée
- [ ] **HTTPS** obligatoire

### Performance
- [ ] **Redis** pour cache
- [ ] **Connection pooling** optimisé
- [ ] **Pagination** sur toutes les listes
- [ ] **Lazy loading** optimisé
- [ ] **Index DB** supplémentaires

### Fonctionnalités
- [ ] **Notification push** temps réel (WebSocket)
- [ ] **Dashboard** temps réel
- [ ] **API mobile** (GraphQL ou REST optimisé)
- [ ] **Génération PDF** pour bulletins
- [ ] **Export Excel** pour rapports
- [ ] **Import CSV** pour données massives

### Tests
- [ ] **Tests unitaires** (JUnit 5)
- [ ] **Tests d'intégration** (Testcontainers)
- [ ] **Tests e2e** (REST Assured)
- [ ] **Couverture de code** (JaCoCo)

---

## 📈 Métriques du Projet

### Code
- **Services**: 11 microservices
- **Bases de données**: 12 bases PostgreSQL
- **Fichiers**: 591 fichiers dans `services/`
- **Documentation**: 11 README.md détaillés

### Complexité
- **Nombre de tables**: ~30 tables
- **Événements Kafka**: 8+ topics
- **Endpoints REST**: ~100+ endpoints (estimation)
- **Rôles**: 4 rôles principaux
- **Permissions**: 12+ permissions pré-configurées

---

## 🎓 Cas d'usage métier

### Pour les étudiants
- ✅ Consulter notes et présences
- ✅ Justifier absences
- ✅ Faire appel si rejet
- ✅ Recevoir notifications
- ✅ Messagerie interne

### Pour les instructeurs
- ✅ Enregistrer présences
- ✅ Saisir notes
- ✅ Consulter rapports de classe
- ✅ Communiquer avec étudiants

### Pour les managers
- ✅ Valider absences
- ✅ Approuver notes
- ✅ Examiner appels
- ✅ Consulter statistiques
- ✅ Gérer structure académique

### Pour les admins
- ✅ Gestion complète utilisateurs
- ✅ Configuration système
- ✅ Audit trail complet
- ✅ Notifications globales
- ✅ Gestion des permissions

---

## 🔍 Conclusion

Ce projet est une **implémentation complète et professionnelle** d'une architecture microservices pour la gestion scolaire. Il démontre :

✅ **Maîtrise de Spring Boot/Cloud**
✅ **Architecture distribuée** bien conçue
✅ **Sécurité moderne** avec JWT et Spring Security
✅ **Patterns avancés** (CQRS, Event Sourcing)
✅ **Documentation exhaustive**
✅ **Workflow métier complexes** (justification, appel, validation)

Le projet est **production-ready** avec quelques améliorations (containerisation, monitoring, tests). L'architecture est **scalable, maintenable et évolutive**.

### Points d'excellence
🌟 **Architecture** - Bien structurée et modulaire
🌟 **Sécurité** - Implementation complète de Spring Security
🌟 **Workflow** - Système de validation hiérarchique sophistiqué
🌟 **Documentation** - README détaillés pour chaque service
🌟 **Modernité** - Java 23, Spring Boot 3.4.1

---

## 📚 Ressources

### Documentation officielle
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Spring Cloud](https://spring.io/projects/spring-cloud)
- [Spring Security](https://spring.io/projects/spring-security)
- [Apache Kafka](https://kafka.apache.org/)
- [PostgreSQL](https://www.postgresql.org/)

### Services
- **Eureka**: http://localhost:8761
- **RabbitMQ Management**: http://localhost:15672
- **API Gateway**: http://localhost:8080

---

**Date d'analyse**: 25 janvier 2026
**Version Java**: 23
**Version Spring Boot**: 3.4.1
**Version Spring Cloud**: 2024.0.0
