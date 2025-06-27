import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectMongoDB } from '../src/config/database.js';

// Import models
import User from '../src/models/User.js';
import Tower from '../src/models/Tower.js';
import Parking from '../src/models/Parking.js';
import PQRS from '../src/models/PQRS.js';
import Notification from '../src/models/Notification.js';
import Reservation from '../src/models/Reservation.js';
import Survey from '../src/models/Survey.js';
import { Payment, PaymentStatus } from '../src/models/Payment.js';
import { Permission, Module, Role, UserStatus } from '../src/models/Permission.js';

dotenv.config();

const fullSpanishSeed = async () => {
  try {
    console.log('🌱 Iniciando carga completa de datos en español...');
    await connectMongoDB();
    console.log('✅ Conectado a MongoDB');

    // Clear existing data
    console.log('🗑️ Limpiando datos existentes...');
    await Promise.all([
      User.deleteMany({}),
      Tower.deleteMany({}),
      Parking.deleteMany({}),
      PQRS.deleteMany({}),
      Notification.deleteMany({}),
      Reservation.deleteMany({}),
      Survey.deleteMany({}),
      Payment.deleteMany({}),
      PaymentStatus.deleteMany({}),
      Permission.deleteMany({}),
      Module.deleteMany({}),
      Role.deleteMany({}),
      UserStatus.deleteMany({})
    ]);
    console.log('✅ Datos limpiados');

    // 1. Create UserStatus
    console.log('📊 Creando estados de usuario...');
    const userStatuses = await UserStatus.insertMany([
      { name: 'active', description: 'Usuario activo', allowLogin: true },
      { name: 'inactive', description: 'Usuario inactivo', allowLogin: false },
      { name: 'suspended', description: 'Usuario suspendido', allowLogin: false },
      { name: 'pending', description: 'Pendiente de activación', allowLogin: false },
      { name: 'blocked', description: 'Usuario bloqueado', allowLogin: false }
    ]);
    console.log(`✅ ${userStatuses.length} estados de usuario creados`);

    // 2. Create PaymentStatus
    console.log('💰 Creando estados de pago...');
    const paymentStatuses = await PaymentStatus.insertMany([
      { name: 'pending', description: 'Pago pendiente', color: '#FFA500', order: 1 },
      { name: 'completed', description: 'Pago completado', color: '#28A745', order: 2 },
      { name: 'failed', description: 'Pago fallido', color: '#DC3545', order: 3 },
      { name: 'cancelled', description: 'Pago cancelado', color: '#6C757D', order: 4 }
    ]);
    console.log(`✅ ${paymentStatuses.length} estados de pago creados`);

    // 3. Create Permissions
    console.log('🔐 Creando permisos...');
    const permissions = await Permission.insertMany([
      { name: 'create_user', description: 'Crear usuarios', category: 'user', action: 'create', resource: 'user' },
      { name: 'read_user', description: 'Ver usuarios', category: 'user', action: 'read', resource: 'user' },
      { name: 'update_user', description: 'Actualizar usuarios', category: 'user', action: 'update', resource: 'user' },
      { name: 'delete_user', description: 'Eliminar usuarios', category: 'user', action: 'delete', resource: 'user' },
      { name: 'manage_apartment', description: 'Gestionar apartamentos', category: 'apartment', action: 'manage', resource: 'apartment' },
      { name: 'manage_parking', description: 'Gestionar parqueaderos', category: 'parking', action: 'manage', resource: 'parking' },
      { name: 'create_pqrs', description: 'Crear PQRS', category: 'pqrs', action: 'create', resource: 'pqrs' },
      { name: 'read_pqrs', description: 'Ver PQRS', category: 'pqrs', action: 'read', resource: 'pqrs' },
      { name: 'approve_pqrs', description: 'Aprobar PQRS', category: 'pqrs', action: 'approve', resource: 'pqrs' },
      { name: 'manage_payment', description: 'Gestionar pagos', category: 'payment', action: 'manage', resource: 'payment' },
      { name: 'manage_system', description: 'Administración completa', category: 'system', action: 'manage', resource: 'system' }
    ]);
    console.log(`✅ ${permissions.length} permisos creados`);

    // 4. Create Modules
    console.log('📦 Creando módulos...');
    const modules = await Module.insertMany([
      { name: 'Dashboard', description: 'Panel principal', path: '/dashboard', icon: 'dashboard', order: 1 },
      { name: 'Usuarios', description: 'Gestión de usuarios', path: '/usuarios', icon: 'users', order: 2 },
      { name: 'Apartamentos', description: 'Gestión de apartamentos', path: '/apartamentos', icon: 'building', order: 3 },
      { name: 'Parqueaderos', description: 'Gestión de parqueaderos', path: '/parqueaderos', icon: 'car', order: 4 },
      { name: 'PQRS', description: 'Peticiones, quejas y reclamos', path: '/pqrs', icon: 'message', order: 5 },
      { name: 'Pagos', description: 'Gestión de pagos', path: '/pagos', icon: 'credit-card', order: 6 }
    ]);
    console.log(`✅ ${modules.length} módulos creados`);

    // 5. Create Roles
    console.log('👥 Creando roles...');
    
    const adminRole = await Role.create({
      name: 'Super Administrador',
      description: 'Acceso completo al sistema',
      level: 1,
      type: 'admin',
      isSystem: true,
      modules: modules.slice(0, 3).map(module => ({
        module: module._id,
        permissions: permissions.filter(p => ['system', 'user', 'payment'].includes(p.category)).map(p => p._id)
      }))
    });

    const ownerRole = await Role.create({
      name: 'Propietario',
      description: 'Propietario de apartamento',
      level: 5,
      type: 'owner',
      isSystem: true,
      modules: [
        {
          module: modules.find(m => m.name === 'Dashboard')._id,
          permissions: [permissions.find(p => p.name === 'read_user')._id]
        },
        {
          module: modules.find(m => m.name === 'PQRS')._id,
          permissions: permissions.filter(p => p.name.includes('pqrs') && p.action !== 'approve').map(p => p._id)
        }
      ]
    });

    const guardRole = await Role.create({
      name: 'Vigilante',
      description: 'Personal de vigilancia',
      level: 8,
      type: 'guard',
      isSystem: true,
      modules: [
        {
          module: modules.find(m => m.name === 'Dashboard')._id,
          permissions: [permissions.find(p => p.name === 'read_user')._id]
        },
        {
          module: modules.find(m => m.name === 'Parqueaderos')._id,
          permissions: [permissions.find(p => p.name === 'manage_parking')._id]
        }
      ]
    });
    console.log('✅ 3 roles creados (Admin, Propietario, Vigilante)');

    // 6. Create Users
    console.log('👤 Creando usuarios...');
    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@valhalla.com',
        password: 'admin123',
        status: 'active',
        role: adminRole._id,
        roleType: 'admin',
        profile: {
          fullName: 'Carlos Ramírez Administrador',
          documentType: 'CC',
          documentNumber: '12345678',
          telephoneNumber: '3001234567'
        }
      },
      {
        username: 'maria.garcia',
        email: 'maria.garcia@email.com',
        password: 'maria123',
        status: 'active',
        role: ownerRole._id,
        roleType: 'owner',
        profile: {
          fullName: 'María García López',
          documentType: 'CC',
          documentNumber: '52478963',
          telephoneNumber: '3109876543'
        },
        ownerInfo: {
          isActive: true,
          emergencyContact: {
            fullName: 'Pedro García',
            telephoneNumber: '3204567890',
            relationship: 'esposo'
          }
        },
        apartmentInfo: {
          apartmentNumber: '301',
          tower: 'Torre A',
          isOwner: true,
          moveInDate: new Date('2023-01-15')
        }
      },
      {
        username: 'luis.martinez',
        email: 'luis.martinez@email.com',
        password: 'luis123',
        status: 'active',
        role: ownerRole._id,
        roleType: 'owner',
        profile: {
          fullName: 'Luis Martínez Rodríguez',
          documentType: 'CC',
          documentNumber: '74125896',
          telephoneNumber: '3157891234'
        },
        ownerInfo: {
          isActive: true,
          emergencyContact: {
            fullName: 'Ana Martínez',
            telephoneNumber: '3162345678',
            relationship: 'esposa'
          }
        },
        apartmentInfo: {
          apartmentNumber: '102',
          tower: 'Torre B',
          isOwner: true,
          moveInDate: new Date('2022-08-20')
        }
      },
      {
        username: 'jorge.vigilante',
        email: 'jorge.morales@valhalla.com',
        password: 'jorge123',
        status: 'active',
        role: guardRole._id,
        roleType: 'guard',
        profile: {
          fullName: 'Jorge Morales Vigilante',
          documentType: 'CC',
          documentNumber: '98765432',
          telephoneNumber: '3051234567'
        }
      }
    ]);
    console.log(`✅ ${users.length} usuarios creados`);

    // 7. Create Towers
    console.log('🏢 Creando torres...');
    const towers = await Tower.insertMany([
      {
        name: 'Torre A',
        description: 'Torre principal del conjunto residencial Valhalla',
        floors: 15,
        details: {
          totalFloors: 15,
          apartmentsPerFloor: 2,
          totalApartments: 3,
          elevators: 2,
          emergencyStairs: 2
        },
        apartments: [
          {
            number: '101', floor: 1, bedrooms: 3, bathrooms: 2, area: 85.5,
            status: 'occupied', monthlyFee: 450000, lastPayment: new Date(),
            ownerInfo: { fullName: 'Ana Rodríguez Pérez', documentNumber: '45678912', phone: '3001112222' }
          },
          {
            number: '301', floor: 3, bedrooms: 3, bathrooms: 2, area: 90.0,
            status: 'occupied', monthlyFee: 480000, lastPayment: new Date(),
            ownerInfo: { fullName: 'María García López', documentNumber: '52478963', phone: '3109876543' }
          },
          {
            number: '501', floor: 5, bedrooms: 2, bathrooms: 1, area: 65.0,
            status: 'available', monthlyFee: 350000, lastPayment: null,
            ownerInfo: null
          }
        ]
      },
      {
        name: 'Torre B',
        description: 'Torre secundaria con vista al parque central',
        floors: 12,
        details: {
          totalFloors: 12,
          apartmentsPerFloor: 2,
          totalApartments: 2,
          elevators: 1,
          emergencyStairs: 2
        },
        apartments: [
          {
            number: '102', floor: 1, bedrooms: 2, bathrooms: 2, area: 75.0,
            status: 'occupied', monthlyFee: 400000, lastPayment: new Date(),
            ownerInfo: { fullName: 'Luis Martínez Rodríguez', documentNumber: '74125896', phone: '3157891234' }
          },
          {
            number: '202', floor: 2, bedrooms: 3, bathrooms: 2, area: 95.0,
            status: 'occupied', monthlyFee: 520000, lastPayment: new Date(),
            ownerInfo: { fullName: 'Isabella Fernández Torres', documentNumber: '67891234', phone: '3186667777' }
          }
        ]
      }
    ]);
    console.log(`✅ ${towers.length} torres creadas con ${towers.reduce((acc, t) => acc + t.apartments.length, 0)} apartamentos`);

    // 8. Create Parking
    console.log('🚗 Creando parqueaderos...');
    const parkingSpaces = await Parking.insertMany([
      {
        number: 'P-001',
        status: 'occupied',
        type: 'regular',
        assignedUserId: users[0]._id, // Using actual user ObjectId
        assignedUserInfo: {
          fullName: 'María García López',
          documentNumber: '52478963',
          phone: '3109876543',
          apartmentNumber: '301',
          towerName: 'Torre A'
        },
        details: {
          floor: -1,
          section: 'A',
          hasElectricCharging: false,
          hasCover: false
        },
        vehicle: {
          type: 'car',
          plate: 'ABC-123',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
          color: 'Blanco'
        }
      },
      {
        number: 'P-002',
        status: 'occupied',
        type: 'covered',
        assignedUserId: users[1]._id, // Using actual user ObjectId
        assignedUserInfo: {
          fullName: 'Luis Martínez Rodríguez',
          documentNumber: '74125896',
          phone: '3157891234',
          apartmentNumber: '102',
          towerName: 'Torre B'
        },
        details: {
          floor: -1,
          section: 'B',
          hasElectricCharging: false,
          hasCover: true
        },
        vehicle: {
          type: 'car',
          plate: 'XYZ-789',
          brand: 'Chevrolet',
          model: 'Spark',
          year: 2019,
          color: 'Azul'
        }
      },
      {
        number: 'P-003',
        status: 'available',
        type: 'regular',
        details: {
          floor: -1,
          section: 'A',
          hasElectricCharging: false,
          hasCover: false
        }
      }
    ]);
    console.log(`✅ ${parkingSpaces.length} espacios de parqueadero creados`);

    // 9. Create PQRS
    console.log('📝 Creando PQRS...');
    const pqrsRecords = await PQRS.insertMany([
      {
        category: 'queja',
        title: 'Ruido excesivo en horas nocturnas',
        description: 'Los vecinos del apartamento 402 están generando ruido excesivo después de las 10:00 PM, lo cual va en contra de las normas de convivencia del conjunto residencial.',
        priority: 'medium',
        createdBy: {
          userId: users[0]._id,
          userInfo: {
            fullName: 'María García López',
            documentNumber: '52478963',
            apartmentNumber: '301',
            towerName: 'Torre A',
            phone: '3109876543',
            email: 'maria.garcia@email.com'
          },
          submissionMethod: 'web'
        },
        currentStatus: 'in_progress',
        sla: {
          acknowledgeBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 day
          respondBy: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
          resolveBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)   // +7 days
        }
      },
      {
        category: 'peticion',
        title: 'Solicitud de reparación de equipos de gimnasio',
        description: 'Solicito comedidamente la reparación de la máquina caminadora ubicada en el gimnasio del conjunto.',
        priority: 'low',
        createdBy: {
          userId: users[1]._id,
          userInfo: {
            fullName: 'Luis Martínez Rodríguez',
            documentNumber: '74125896',
            apartmentNumber: '102',
            towerName: 'Torre B',
            phone: '3157891234',
            email: 'luis.martinez@email.com'
          },
          submissionMethod: 'web'
        },
        currentStatus: 'pending_info',
        sla: {
          acknowledgeBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 day
          respondBy: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days  
          resolveBy: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)  // +10 days
        }
      }
    ]);
    console.log(`✅ ${pqrsRecords.length} registros PQRS creados`);

    // 10. Create Payments
    console.log('💳 Creando pagos...');
    const payments = await Payment.insertMany([
      {
        owner: users[0]._id,
        totalAmount: 480000,
        paymentStatus: 'completed',
        paymentMethod: 'bank_transfer',
        referenceNumber: 'ADMIN-MAR-2024-301',
        paymentDate: new Date('2024-03-10'),
        dueDate: new Date('2024-03-15'),
        items: [{
          description: 'Cuota de administración - Marzo 2024',
          amount: 480000,
          category: 'maintenance'
        }],
        notes: 'Pago de cuota mensual Torre A - Apt 301'
      },
      {
        owner: users[1]._id,
        totalAmount: 400000,
        paymentStatus: 'pending',
        paymentMethod: 'bank_transfer',
        referenceNumber: 'ADMIN-MAR-2024-102',
        dueDate: new Date('2024-03-15'),
        items: [{
          description: 'Cuota de administración - Marzo 2024',
          amount: 400000,
          category: 'maintenance'
        }],
        notes: 'Pago pendiente Torre B - Apt 102'
      }
    ]);
    console.log(`✅ ${payments.length} pagos creados`);

    // 11. Create Notifications
    console.log('🔔 Creando notificaciones...');
    const notifications = await Notification.insertMany([
      {
        type: 'maintenance',
        title: 'Mantenimiento preventivo de ascensores',
        description: 'Se realizará mantenimiento preventivo a los ascensores el próximo sábado de 8:00 AM a 12:00 PM.',
        targetAudience: 'all',
        priority: 'medium',
        isActive: true,
        settings: {
          isUrgent: false,
          allowComments: true,
          requireConfirmation: false
        }
      },
      {
        type: 'payment',
        title: 'Recordatorio: Fecha límite de pago',
        description: 'La fecha límite para el pago de la cuota de administración es el día 15 de cada mes.',
        targetAudience: 'owners',
        priority: 'medium',
        isActive: true,
        settings: {
          isUrgent: false,
          allowComments: false,
          requireConfirmation: false
        }
      }
    ]);
    console.log(`✅ ${notifications.length} notificaciones creadas`);

    // 12. Create Reservations
    console.log('📅 Creando reservaciones...');
    const reservations = await Reservation.insertMany([
      {
        type: 'pool',
        status: 'confirmed',
        title: 'Fiesta de cumpleaños infantil',
        description: 'Celebración de cumpleaños con niños en la piscina',
        reservationDate: new Date('2025-06-28'),
        startTime: new Date('2025-06-28T10:00:00.000Z'),
        endTime: new Date('2025-06-28T12:00:00.000Z'),
        eventType: 'birthday',
        reservedBy: {
          userId: 12345, // Using number as required by model
          userInfo: {
            fullName: 'María García López',
            apartmentNumber: '301',
            towerName: 'Torre A',
            phone: '3109876543'
          }
        },
        attendees: {
          expectedCount: 4,
          childrenCount: 2,
          adultCount: 2
        },
        cost: {
          baseFee: 50000,
          total: 50000,
          currency: 'COP'
        },
        specialRequests: 'Necesitamos toallas adicionales para los niños'
      },
      {
        type: 'bbq_area',
        status: 'pending',
        title: 'Reunión familiar de fin de mes',
        description: 'Asado familiar para celebrar el fin de mes',
        reservationDate: new Date('2025-06-30'),
        startTime: new Date('2025-06-30T18:00:00.000Z'),
        endTime: new Date('2025-06-30T22:00:00.000Z'),
        eventType: 'family_gathering',
        reservedBy: {
          userId: 12346,
          userInfo: {
            fullName: 'Luis Martínez Rodríguez',
            apartmentNumber: '102',
            towerName: 'Torre B',
            phone: '3157891234'
          }
        },
        attendees: {
          expectedCount: 8,
          adultCount: 6,
          childrenCount: 2
        },
        cost: {
          baseFee: 80000,
          cleaningFee: 20000,
          total: 100000,
          currency: 'COP'
        },
        specialRequests: 'Solicito mesa adicional para la comida'
      },
      {
        type: 'meeting_room',
        status: 'confirmed',
        title: 'Reunión de propietarios Torre B',
        description: 'Reunión mensual de los propietarios de Torre B',
        reservationDate: new Date('2025-06-26'),
        startTime: new Date('2025-06-26T19:00:00.000Z'),
        endTime: new Date('2025-06-26T21:00:00.000Z'),
        eventType: 'meeting',
        reservedBy: {
          userId: 12347,
          userInfo: {
            fullName: 'Isabella Fernández Torres',
            apartmentNumber: '202',
            towerName: 'Torre B',
            phone: '3186667777'
          }
        },
        attendees: {
          expectedCount: 12,
          adultCount: 12
        },
        equipment: {
          requested: [
            { item: 'Proyector', quantity: 1, cost: 30000 },
            { item: 'Pantalla', quantity: 1, cost: 15000 }
          ]
        },
        cost: {
          baseFee: 60000,
          equipmentFee: 45000,
          total: 105000,
          currency: 'COP'
        },
        specialRequests: 'Proyector y pantalla para presentación'
      },
      {
        type: 'gym',
        status: 'confirmed',
        title: 'Rutina matutina de ejercicio',
        description: 'Sesión personal de ejercicio en el gimnasio',
        reservationDate: new Date('2025-07-02'),
        startTime: new Date('2025-07-02T06:00:00.000Z'),
        endTime: new Date('2025-07-02T07:30:00.000Z'),
        eventType: 'exercise',
        reservedBy: {
          userId: 12348,
          userInfo: {
            fullName: 'Jorge Morales Vigilante',
            apartmentNumber: 'Personal',
            towerName: 'Empleado',
            phone: '3051234567'
          }
        },
        attendees: {
          expectedCount: 1,
          adultCount: 1
        },
        cost: {
          baseFee: 25000,
          total: 25000,
          currency: 'COP'
        }
      }
    ]);
    console.log(`✅ ${reservations.length} reservaciones creadas`);

    // 13. Create Surveys
    console.log('📊 Creando encuestas...');
    
    // Generate ObjectIds for questions to reference in responses
    const questionId1 = new mongoose.Types.ObjectId();
    const questionId2 = new mongoose.Types.ObjectId();
    const questionId3 = new mongoose.Types.ObjectId();
    const questionId4 = new mongoose.Types.ObjectId();
    const questionId5 = new mongoose.Types.ObjectId();
    
    const surveys = await Survey.insertMany([
      {
        name: 'satisfaccion_servicios_2025',
        title: 'Encuesta de Satisfacción - Servicios del Conjunto 2025',
        description: 'Queremos conocer su opinión sobre los servicios y amenidades del conjunto residencial para mejorar continuamente.',
        category: 'satisfaction',
        purpose: 'Evaluar la calidad de los servicios y identificar áreas de mejora',
        
        // Survey settings
        settings: {
          access: {
            type: 'restricted',
            allowedRoles: ['owner', 'resident']
          },
          responses: {
            allowMultiple: false,
            requireLogin: true,
            allowAnonymous: true,
            maxResponses: 1000
          },
          display: {
            showProgressBar: true,
            showQuestionNumbers: true,
            questionsPerPage: 5
          }
        },
        
        // Survey lifecycle
        lifecycle: {
          status: 'active',
          startsAt: new Date('2025-06-01'),
          endsAt: new Date('2025-06-30'),
          targetAudience: {
            description: 'Propietarios y residentes del conjunto',
            estimatedSize: 50,
            actualSize: 45
          }
        },
        
        // Creator information
        createdBy: {
          userId: users[0]._id, // Admin user ObjectId
          userInfo: {
            fullName: 'Carlos Ramírez Administrador',
            role: 'admin',
            department: 'Administración'
          }
        },
        
        questions: [
          {
            _id: questionId1,
            type: 'rating',
            title: '¿Cómo califica la atención del personal de portería?',
            description: 'Evalúe del 1 al 5 donde 1 es muy malo y 5 es excelente',
            config: {
              validation: {
                required: true
              },
              scale: {
                min: 1,
                max: 5,
                step: 1,
                minLabel: 'Muy malo',
                maxLabel: 'Excelente'
              }
            },
            order: 1
          },
          {
            _id: questionId2,
            type: 'single_choice',
            title: '¿Cuál considera el mejor horario para el mantenimiento de zonas comunes?',
            description: 'Seleccione la opción que mejor se adapte a sus necesidades',
            config: {
              validation: {
                required: true
              },
              options: [
                { value: 'morning', label: 'Mañana (8:00 AM - 12:00 PM)', order: 1 },
                { value: 'afternoon', label: 'Tarde (2:00 PM - 6:00 PM)', order: 2 },
                { value: 'weekend', label: 'Fines de semana', order: 3 },
                { value: 'any', label: 'Cualquier horario', order: 4 }
              ]
            },
            order: 2
          },
          {
            _id: questionId3,
            type: 'rating',
            title: '¿Qué tan satisfecho está con el estado de las zonas comunes?',
            description: 'Incluye piscina, gimnasio, jardines, salones',
            config: {
              validation: {
                required: true
              },
              scale: {
                min: 1,
                max: 5,
                step: 1,
                minLabel: 'Muy insatisfecho',
                maxLabel: 'Muy satisfecho'
              }
            },
            order: 3
          },
          {
            _id: questionId4,
            type: 'text',
            title: '¿Qué nuevos servicios o amenidades le gustaría que tuviera el conjunto?',
            description: 'Comparta sus ideas y sugerencias',
            config: {
              validation: {
                required: false,
                maxLength: 500
              },
              display: {
                placeholder: 'Escriba aquí sus sugerencias...'
              }
            },
            order: 4
          },
          {
            _id: questionId5,
            type: 'yes_no',
            title: '¿Recomendaría vivir en este conjunto residencial a familiares o amigos?',
            description: 'Esta pregunta nos ayuda a medir su satisfacción general',
            config: {
              validation: {
                required: true
              }
            },
            order: 5
          }
        ],
        
        responses: [
          {
            respondent: {
              userId: users[1]._id, // María García ObjectId
              userInfo: {
                fullName: 'María García López',
                email: 'maria.garcia@email.com',
                apartmentNumber: '301',
                towerName: 'Torre A'
              },
              isAnonymous: false
            },
            answers: [
              { 
                questionId: questionId1, 
                answer: 4
              },
              { 
                questionId: questionId2, 
                answer: 'morning'
              },
              { 
                questionId: questionId3, 
                answer: 5
              },
              { 
                questionId: questionId4, 
                answer: 'Me gustaría que hubiera una zona de coworking y canchas de tenis'
              },
              { 
                questionId: questionId5, 
                answer: 'yes'
              }
            ],
            session: {
              startedAt: new Date('2025-06-15T09:00:00Z'),
              submittedAt: new Date('2025-06-15T09:15:00Z'),
              completedAt: new Date('2025-06-15T09:15:00Z'),
              timeSpent: 900, // 15 minutes in seconds
              status: 'completed',
              progressPercent: 100
            }
          },
          {
            respondent: {
              userId: users[2]._id, // Luis Martínez ObjectId
              userInfo: {
                fullName: 'Luis Martínez Rodríguez',
                email: 'luis.martinez@email.com',
                apartmentNumber: '102',
                towerName: 'Torre B'
              },
              isAnonymous: false
            },
            answers: [
              { 
                questionId: questionId1, 
                answer: 5
              },
              { 
                questionId: questionId2, 
                answer: 'afternoon'
              },
              { 
                questionId: questionId3, 
                answer: 4
              },
              { 
                questionId: questionId4, 
                answer: 'Sería genial tener una guardería para niños pequeños'
              },
              { 
                questionId: questionId5, 
                answer: 'yes'
              }
            ],
            session: {
              startedAt: new Date('2025-06-18T14:30:00Z'),
              submittedAt: new Date('2025-06-18T14:42:00Z'),
              completedAt: new Date('2025-06-18T14:42:00Z'),
              timeSpent: 720, // 12 minutes in seconds
              status: 'completed',
              progressPercent: 100
            }
          }
        ],
        
        analytics: {
          totalResponses: 2,
          completedResponses: 2,
          partialResponses: 0,
          abandonedResponses: 0,
          completionRate: 100,
          averageTimeToComplete: 810, // 13.5 minutes in seconds
          lastCalculated: new Date()
        }
      }
    ]);
    console.log(`✅ ${surveys.length} encuestas creadas`);

    console.log('\n🎉 ¡Datos completos en español creados exitosamente!');
    console.log('\n📊 RESUMEN COMPLETO:');
    console.log(`   👤 Usuarios: ${users.length} (admin, propietarios, vigilante)`);
    console.log(`   🏢 Torres: ${towers.length} con ${towers.reduce((acc, t) => acc + t.apartments.length, 0)} apartamentos`);
    console.log(`   🚗 Parqueaderos: ${parkingSpaces.length} espacios`);
    console.log(`   📝 PQRS: ${pqrsRecords.length} registros`);
    console.log(`   💳 Pagos: ${payments.length} transacciones`);
    console.log(`   🔔 Notificaciones: ${notifications.length} avisos`);
    console.log(`   � Reservaciones: ${reservations.length} (piscina, BBQ, sala de juntas, gimnasio)`);
    console.log(`   📊 Encuestas: ${surveys.length} con ${surveys[0].questions.length} preguntas y ${surveys[0].responses.length} respuestas`);
    console.log(`   �🔐 Permisos: ${permissions.length} permisos`);
    console.log(`   👥 Roles: 3 roles del sistema`);
    console.log(`   📊 Estados: ${userStatuses.length} estados de usuario, ${paymentStatuses.length} estados de pago`);
    console.log(`   📦 Módulos: ${modules.length} módulos`);
    
    console.log('\n🔑 CREDENCIALES DE ACCESO:');
    console.log('   - admin / admin123 (Carlos Ramírez - Super Administrador)');
    console.log('   - maria.garcia / maria123 (María García - Propietaria Torre A-301)');
    console.log('   - luis.martinez / luis123 (Luis Martínez - Propietario Torre B-102)');
    console.log('   - jorge.vigilante / jorge123 (Jorge Morales - Vigilante)');

  } catch (error) {
    console.error('❌ Error cargando datos:', error);
    console.error('Stack completo:', error.stack);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Conexión a base de datos cerrada');
  }
};

fullSpanishSeed()
  .then(() => {
    console.log('\n🎉 ¡Carga de datos completada exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error en la carga de datos:', error);
    process.exit(1);
  });
