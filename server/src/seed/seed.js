import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import Department from '../models/Department.js';
import LeavePolicy from '../models/LeavePolicy.js';
import LeaveBalance from '../models/LeaveBalance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';
import TrainingProgram from '../models/TrainingProgram.js';
import TrainingEnrollment from '../models/TrainingEnrollment.js';
import Holiday from '../models/Holiday.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import { getOrgDateString } from '../utils/timezone.js';

dotenv.config();

const SEED_PASSWORD = 'StaffSync@2026';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      EmployeeProfile.deleteMany({}),
      Department.deleteMany({}),
      LeavePolicy.deleteMany({}),
      LeaveBalance.deleteMany({}),
      LeaveRequest.deleteMany({}),
      Attendance.deleteMany({}),
      Announcement.deleteMany({}),
      TrainingProgram.deleteMany({}),
      TrainingEnrollment.deleteMany({}),
      Holiday.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({})
    ]);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, salt);

    // 1. Seed Departments
    console.log('[Seed] Creating departments...');
    const engineering = await Department.create({
      name: 'Engineering',
      code: 'ENG',
      description: 'Software development, cloud infrastructure, and technical QA.'
    });
    const hrDept = await Department.create({
      name: 'Human Resources',
      code: 'HR',
      description: 'People operations, recruitment, employee relations, and compliance.'
    });
    const productDept = await Department.create({
      name: 'Product & Design',
      code: 'PRD',
      description: 'Product management, UX/UI design, and user research.'
    });
    const marketingDept = await Department.create({
      name: 'Marketing & Sales',
      code: 'MKT',
      description: 'Growth marketing, brand strategy, sales enablement, and partnerships.'
    });
    const operationsDept = await Department.create({
      name: 'Operations',
      code: 'OPS',
      description: 'Business operations, facilities, and customer support.'
    });

    // 2. Seed Leave Policies
    console.log('[Seed] Creating leave policies...');
    await LeavePolicy.create([
      {
        leaveType: 'casual',
        title: 'Casual Leave',
        annualQuota: 12,
        maxConsecutiveDays: 3,
        carryForwardMax: 3,
        requiresProofDays: 3,
        description: 'For short personal needs and emergencies.'
      },
      {
        leaveType: 'sick',
        title: 'Sick / Medical Leave',
        annualQuota: 10,
        maxConsecutiveDays: 7,
        carryForwardMax: 0,
        requiresProofDays: 2,
        description: 'For health recovery and medical appointments.'
      },
      {
        leaveType: 'earned',
        title: 'Earned / Annual Vacation',
        annualQuota: 15,
        maxConsecutiveDays: 14,
        carryForwardMax: 5,
        requiresProofDays: 0,
        description: 'Paid vacation leave accrued annually.'
      },
      {
        leaveType: 'unpaid',
        title: 'Unpaid Leave (Leave Without Pay)',
        annualQuota: 30,
        maxConsecutiveDays: 30,
        carryForwardMax: 0,
        requiresProofDays: 0,
        description: 'Leave taken beyond allotted paid quotas.'
      }
    ]);

    // 3. Seed Holidays (2026)
    console.log('[Seed] Creating 2026 holidays...');
    await Holiday.create([
      { name: "New Year's Day", date: new Date('2026-01-01'), description: 'Global holiday marking start of the year', year: 2026 },
      { name: 'Republic / Constitution Day', date: new Date('2026-01-26'), description: 'National observance', year: 2026 },
      { name: 'Spring Equinox Festival', date: new Date('2026-03-20'), description: 'Celebration of spring', year: 2026 },
      { name: 'Labor Day', date: new Date('2026-05-01'), description: 'International Workers Day', year: 2026 },
      { name: 'Independence Day', date: new Date('2026-07-04'), description: 'National Independence', year: 2026 },
      { name: 'Harvest Festival', date: new Date('2026-09-15'), description: 'Traditional seasonal celebration', year: 2026 },
      { name: 'Thanksgiving Day', date: new Date('2026-11-26'), description: 'Annual holiday of gratitude', year: 2026 },
      { name: 'Winter Holiday / Christmas', date: new Date('2026-12-25'), description: 'Year-end festive holiday', year: 2026 }
    ]);

    // 4. Seed HR Administrator
    console.log('[Seed] Creating HR Admin...');
    const adminUser = await User.create({
      email: 'admin@staffsync.com',
      passwordHash,
      role: 'hr_admin',
      isActive: true
    });

    const adminProfile = await EmployeeProfile.create({
      user: adminUser._id,
      employeeId: 'EMP-ADM01',
      firstName: 'Eleanor',
      lastName: 'Vance',
      email: 'admin@staffsync.com',
      phone: '+1 (555) 010-0001',
      department: hrDept._id,
      designation: 'Head of People & HR Operations',
      role: 'hr_admin',
      joiningDate: new Date('2023-01-10'),
      employmentStatus: 'full_time',
      address: {
        street: '100 Enterprise Way',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA'
      },
      emergencyContact: {
        name: 'George Vance',
        relationship: 'Spouse',
        phone: '+1 (555) 010-9999'
      }
    });

    adminUser.employeeProfile = adminProfile._id;
    await adminUser.save();
    hrDept.head = adminUser._id;
    await hrDept.save();

    // 5. Seed Managers
    console.log('[Seed] Creating Managers...');
    // Manager 1: Engineering Manager
    const engManagerUser = await User.create({
      email: 'manager.eng@staffsync.com',
      passwordHash,
      role: 'manager',
      isActive: true
    });

    const engManagerProfile = await EmployeeProfile.create({
      user: engManagerUser._id,
      employeeId: 'EMP-MGR01',
      firstName: 'Marcus',
      lastName: 'Sterling',
      email: 'manager.eng@staffsync.com',
      phone: '+1 (555) 010-0002',
      department: engineering._id,
      designation: 'VP of Engineering',
      role: 'manager',
      joiningDate: new Date('2023-03-15'),
      employmentStatus: 'full_time',
      address: { street: '240 Tech Blvd', city: 'San Jose', state: 'CA', postalCode: '95110', country: 'USA' },
      emergencyContact: { name: 'Linda Sterling', relationship: 'Spouse', phone: '+1 (555) 010-9998' }
    });

    engManagerUser.employeeProfile = engManagerProfile._id;
    await engManagerUser.save();
    engineering.head = engManagerUser._id;
    await engineering.save();

    // Manager 2: Product & Operations Manager
    const opsManagerUser = await User.create({
      email: 'manager.hr@staffsync.com',
      passwordHash,
      role: 'manager',
      isActive: true
    });

    const opsManagerProfile = await EmployeeProfile.create({
      user: opsManagerUser._id,
      employeeId: 'EMP-MGR02',
      firstName: 'Samantha',
      lastName: 'Ray',
      email: 'manager.hr@staffsync.com',
      phone: '+1 (555) 010-0003',
      department: productDept._id,
      designation: 'Director of Product & Experience',
      role: 'manager',
      joiningDate: new Date('2023-04-01'),
      employmentStatus: 'full_time',
      address: { street: '55 Creative Ave', city: 'Oakland', state: 'CA', postalCode: '94607', country: 'USA' },
      emergencyContact: { name: 'Lucas Ray', relationship: 'Sibling', phone: '+1 (555) 010-9997' }
    });

    opsManagerUser.employeeProfile = opsManagerProfile._id;
    await opsManagerUser.save();
    productDept.head = opsManagerUser._id;
    await productDept.save();

    // 6. Seed 10 Employees
    console.log('[Seed] Creating 10 employees across departments...');
    const employeeSeedData = [
      {
        id: 'EMP-1001',
        first: 'John',
        last: 'Doe',
        email: 'john.doe@staffsync.com',
        phone: '+1 (555) 011-1001',
        dept: engineering._id,
        desig: 'Senior Full Stack Developer',
        mgr: engManagerUser._id,
        join: '2023-06-01'
      },
      {
        id: 'EMP-1002',
        first: 'Jane',
        last: 'Smith',
        email: 'jane.smith@staffsync.com',
        phone: '+1 (555) 011-1002',
        dept: engineering._id,
        desig: 'Frontend UI/UX Specialist',
        mgr: engManagerUser._id,
        join: '2023-08-15'
      },
      {
        id: 'EMP-1003',
        first: 'Michael',
        last: 'Johnson',
        email: 'michael.johnson@staffsync.com',
        phone: '+1 (555) 011-1003',
        dept: engineering._id,
        desig: 'DevOps & Cloud Engineer',
        mgr: engManagerUser._id,
        join: '2023-09-01'
      },
      {
        id: 'EMP-1004',
        first: 'Emily',
        last: 'Davis',
        email: 'emily.davis@staffsync.com',
        phone: '+1 (555) 011-1004',
        dept: productDept._id,
        desig: 'Senior Product Designer',
        mgr: opsManagerUser._id,
        join: '2023-10-10'
      },
      {
        id: 'EMP-1005',
        first: 'Robert',
        last: 'Brown',
        email: 'robert.brown@staffsync.com',
        phone: '+1 (555) 011-1005',
        dept: engineering._id,
        desig: 'Principal Backend Architect',
        mgr: engManagerUser._id,
        join: '2023-11-01'
      },
      {
        id: 'EMP-1006',
        first: 'Sarah',
        last: 'Wilson',
        email: 'sarah.wilson@staffsync.com',
        phone: '+1 (555) 011-1006',
        dept: hrDept._id,
        desig: 'HR Specialist & Talent Partner',
        mgr: adminUser._id,
        join: '2024-01-15'
      },
      {
        id: 'EMP-1007',
        first: 'David',
        last: 'Miller',
        email: 'david.miller@staffsync.com',
        phone: '+1 (555) 011-1007',
        dept: marketingDept._id,
        desig: 'Digital Growth Lead',
        mgr: opsManagerUser._id,
        join: '2024-02-01'
      },
      {
        id: 'EMP-1008',
        first: 'Jessica',
        last: 'Taylor',
        email: 'jessica.taylor@staffsync.com',
        phone: '+1 (555) 011-1008',
        dept: operationsDept._id,
        desig: 'Customer Success Specialist',
        mgr: opsManagerUser._id,
        join: '2024-03-01'
      },
      {
        id: 'EMP-1009',
        first: 'Thomas',
        last: 'Anderson',
        email: 'thomas.anderson@staffsync.com',
        phone: '+1 (555) 011-1009',
        dept: engineering._id,
        desig: 'Systems & Security Analyst',
        mgr: engManagerUser._id,
        join: '2024-04-15'
      },
      {
        id: 'EMP-1010',
        first: 'Olivia',
        last: 'Martinez',
        email: 'olivia.martinez@staffsync.com',
        phone: '+1 (555) 011-1010',
        dept: productDept._id,
        desig: 'Product Marketing Manager',
        mgr: opsManagerUser._id,
        join: '2024-05-01'
      }
    ];

    const createdUsers = [adminUser, engManagerUser, opsManagerUser];

    for (const emp of employeeSeedData) {
      const user = await User.create({
        email: emp.email,
        passwordHash,
        role: 'employee',
        isActive: true
      });

      const profile = await EmployeeProfile.create({
        user: user._id,
        employeeId: emp.id,
        firstName: emp.first,
        lastName: emp.last,
        email: emp.email,
        phone: emp.phone,
        department: emp.dept,
        designation: emp.desig,
        role: 'employee',
        joiningDate: new Date(emp.join),
        employmentStatus: 'full_time',
        reportingManager: emp.mgr,
        address: { street: '42 Innovation Road', city: 'San Francisco', state: 'CA', postalCode: '94107', country: 'USA' },
        emergencyContact: { name: `${emp.first}'s Relative`, relationship: 'Family', phone: '+1 (555) 019-8888' }
      });

      user.employeeProfile = profile._id;
      await user.save();
      createdUsers.push(user);
    }

    // 7. Seed Leave Balances for all 13 users
    console.log('[Seed] Initializing 2026 leave balances...');
    for (const u of createdUsers) {
      await LeaveBalance.create({
        employee: u._id,
        year: 2026,
        casual: { total: 12, used: 2, pending: 1 },
        sick: { total: 10, used: 1, pending: 0 },
        earned: { total: 15, used: 3, pending: 0 },
        unpaid: { total: 30, used: 0, pending: 0 }
      });
    }

    // 8. Seed Attendance records for past days and today
    console.log('[Seed] Seeding attendance records...');
    const todayStr = getOrgDateString();
    const today = new Date();

    // Check-in several employees for today
    // John Doe (checked in, present)
    const emp1 = createdUsers.find((u) => u.email === 'john.doe@staffsync.com');
    const checkInTime1 = new Date();
    checkInTime1.setUTCHours(9, 5, 0, 0);
    await Attendance.create({
      employee: emp1._id,
      date: todayStr,
      checkIn: checkInTime1,
      status: 'present',
      shiftType: 'standard',
      notes: 'Standard morning shift'
    });

    // Jane Smith (checked in, completed session with check out)
    const emp2 = createdUsers.find((u) => u.email === 'jane.smith@staffsync.com');
    const checkInTime2 = new Date();
    checkInTime2.setUTCHours(8, 45, 0, 0);
    const checkOutTime2 = new Date();
    checkOutTime2.setUTCHours(17, 15, 0, 0);
    await Attendance.create({
      employee: emp2._id,
      date: todayStr,
      checkIn: checkInTime2,
      checkOut: checkOutTime2,
      durationMinutes: 510,
      status: 'present',
      shiftType: 'standard',
      notes: 'Completed sprint demo prep'
    });

    // Michael Johnson (late check-in today)
    const emp3 = createdUsers.find((u) => u.email === 'michael.johnson@staffsync.com');
    const checkInTime3 = new Date();
    checkInTime3.setUTCHours(10, 15, 0, 0);
    await Attendance.create({
      employee: emp3._id,
      date: todayStr,
      checkIn: checkInTime3,
      status: 'late',
      shiftType: 'standard',
      notes: 'Delayed due to transit'
    });

    // Seed historical attendance records for the last 5 days
    for (let i = 1; i <= 5; i++) {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - i);
      const pastStr = getOrgDateString(pastDate);

      for (const u of createdUsers.slice(0, 8)) {
        const inTime = new Date(pastDate);
        inTime.setUTCHours(9, Math.floor(Math.random() * 20), 0);
        const outTime = new Date(pastDate);
        outTime.setUTCHours(17, 30 + Math.floor(Math.random() * 30), 0);
        const dur = Math.round((outTime - inTime) / (1000 * 60));

        await Attendance.create({
          employee: u._id,
          date: pastStr,
          checkIn: inTime,
          checkOut: outTime,
          durationMinutes: dur,
          status: 'present',
          shiftType: 'standard'
        });
      }
    }

    // 9. Seed Leave Requests (pending, approved, rejected)
    console.log('[Seed] Seeding leave requests...');
    // Approved leave for John Doe
    await LeaveRequest.create({
      employee: emp1._id,
      leaveType: 'casual',
      startDate: new Date('2026-11-10'),
      endDate: new Date('2026-11-11'),
      totalDays: 2,
      reason: 'Personal family engagement and travel.',
      status: 'approved',
      reviewedBy: engManagerUser._id,
      reviewedAt: new Date(),
      reviewComment: 'Approved. Enjoy your time off!'
    });

    // Pending leave for Jane Smith
    await LeaveRequest.create({
      employee: emp2._id,
      leaveType: 'earned',
      startDate: new Date('2026-12-01'),
      endDate: new Date('2026-12-05'),
      totalDays: 5,
      reason: 'Annual year-end family vacation.',
      status: 'pending'
    });

    // Rejected leave for Michael Johnson
    await LeaveRequest.create({
      employee: emp3._id,
      leaveType: 'sick',
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-10-16'),
      totalDays: 2,
      reason: 'Routine checkup.',
      status: 'rejected',
      reviewedBy: engManagerUser._id,
      reviewedAt: new Date('2026-10-14'),
      reviewComment: 'Please reschedule after critical cloud migration deployment.'
    });

    // Pending leave for Emily Davis
    const emp4 = createdUsers.find((u) => u.email === 'emily.davis@staffsync.com');
    await LeaveRequest.create({
      employee: emp4._id,
      leaveType: 'casual',
      startDate: new Date('2026-11-18'),
      endDate: new Date('2026-11-19'),
      totalDays: 2,
      reason: 'Attending design conference workshop.',
      status: 'pending'
    });

    // 10. Seed Announcements
    console.log('[Seed] Seeding company announcements...');
    await Announcement.create([
      {
        title: 'Welcome to StaffSync 2.0 HR Portal',
        content: 'We are thrilled to launch our next-generation HR management platform. Manage your attendance, leave applications, training programs, and personal records seamlessly.',
        targetAudience: 'all',
        priority: 'urgent',
        status: 'published',
        publishedAt: new Date(),
        author: adminUser._id
      },
      {
        title: 'Q4 Performance Reviews & OKR Submissions',
        content: 'All team leads and employees should align on final quarterly targets by the 15th of next month. Review schedules will be shared by department heads.',
        targetAudience: 'all',
        priority: 'high',
        status: 'published',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        author: adminUser._id
      },
      {
        title: 'Engineering Architecture Tech Talk',
        content: 'Join our engineering all-hands this Thursday at 3:00 PM for a deep dive into event-driven cloud microservices architecture.',
        targetAudience: 'department',
        targetDepartment: engineering._id,
        priority: 'normal',
        status: 'published',
        publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        author: engManagerUser._id
      },
      {
        title: 'Annual Healthcare Benefit Re-enrollment',
        content: 'Health insurance open enrollment begins next Monday. Check your company email for plan comparison documentation.',
        targetAudience: 'all',
        priority: 'normal',
        status: 'published',
        publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        author: adminUser._id
      }
    ]);

    // 11. Seed Training Programs and Enrollments
    console.log('[Seed] Seeding training programs...');
    const t1 = await TrainingProgram.create({
      title: 'Modern Cloud Architecture & Docker/Kubernetes Mastery',
      description: 'Hands-on training covering container orchestration, microservice telemetry, CI/CD pipelines, and zero-downtime deployments.',
      instructor: 'Alex Rivera (Staff Cloud Architect)',
      startDate: new Date('2026-11-15'),
      endDate: new Date('2026-11-20'),
      durationHours: 16,
      capacity: 25,
      status: 'upcoming',
      department: engineering._id,
      createdBy: engManagerUser._id
    });

    const t2 = await TrainingProgram.create({
      title: 'High-Impact Enterprise Communication & Leadership',
      description: 'Core leadership workshop focusing on active listening, strategic feedback delivery, conflict resolution, and cross-functional influence.',
      instructor: 'Eleanor Vance (Head of People)',
      startDate: new Date('2026-11-05'),
      endDate: new Date('2026-11-07'),
      durationHours: 8,
      capacity: 15,
      status: 'upcoming',
      department: hrDept._id,
      createdBy: adminUser._id
    });

    const t3 = await TrainingProgram.create({
      title: 'Design Systems & WCAG 2.2 Accessibility Standards',
      description: 'Comprehensive review of building accessible enterprise component libraries with high color contrast, keyboard navigation, and screen reader testing.',
      instructor: 'Samantha Ray',
      startDate: new Date('2026-10-10'),
      endDate: new Date('2026-10-14'),
      durationHours: 10,
      capacity: 20,
      status: 'completed',
      department: productDept._id,
      createdBy: opsManagerUser._id
    });

    // Enrollments
    await TrainingEnrollment.create([
      {
        training: t1._id,
        employee: emp1._id,
        status: 'enrolled',
        progressPercent: 0
      },
      {
        training: t1._id,
        employee: emp2._id,
        status: 'enrolled',
        progressPercent: 0
      },
      {
        training: t3._id,
        employee: emp1._id,
        status: 'completed',
        progressPercent: 100,
        completedAt: new Date('2026-10-14')
      },
      {
        training: t3._id,
        employee: emp4._id,
        status: 'completed',
        progressPercent: 100,
        completedAt: new Date('2026-10-14')
      }
    ]);

    // 12. Seed Notifications
    console.log('[Seed] Seeding sample notifications...');
    await Notification.create([
      {
        recipient: adminUser._id,
        title: 'New Leave Request Submitted',
        message: 'Jane Smith applied for 5 days of earned leave.',
        link: '/leaves/approvals',
        type: 'leave'
      },
      {
        recipient: emp1._id,
        title: 'Leave Request Approved',
        message: 'Your 2-day casual leave request has been approved by Marcus Sterling.',
        link: '/leaves/apply',
        type: 'leave'
      },
      {
        recipient: engManagerUser._id,
        title: 'Team Attendance Alert',
        message: '1 team member checked in late today.',
        link: '/attendance',
        type: 'attendance'
      }
    ]);

    // 13. Seed Audit Logs
    console.log('[Seed] Seeding initial audit logs...');
    await AuditLog.create([
      {
        action: 'SYSTEM_SEEDED',
        performedBy: adminUser._id,
        targetEntity: 'System',
        entityId: 'StaffSync-Init',
        details: { message: 'Database seeded with enterprise HR demo dataset' },
        ipAddress: '127.0.0.1'
      },
      {
        action: 'EMPLOYEE_CREATED',
        performedBy: adminUser._id,
        targetEntity: 'EmployeeProfile',
        entityId: adminProfile._id.toString(),
        details: { employeeId: 'EMP-ADM01', email: 'admin@staffsync.com' },
        ipAddress: '127.0.0.1'
      }
    ]);

    console.log('========================================================');
    console.log(' [Seed Success] StaffSync database successfully seeded!');
    console.log(' Demo Accounts:');
    console.log(' - HR Admin:  admin@staffsync.com       / StaffSync@2026');
    console.log(' - Manager 1: manager.eng@staffsync.com / StaffSync@2026');
    console.log(' - Manager 2: manager.hr@staffsync.com  / StaffSync@2026');
    console.log(' - Employee:  john.doe@staffsync.com    / StaffSync@2026');
    console.log('========================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();

