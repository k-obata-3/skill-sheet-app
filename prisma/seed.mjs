import { PrismaClient, Role, SkillCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.create({
    data: { name: "サンプル株式会社" }
  });

  const passwordHash = await bcrypt.hash("test1234", 12);

  await prisma.user.create({
    data: {
      companyId: company.id,
      email: "owner@example.com",
      name: "管理者　太郎",
      role: Role.OWNER,
      passwordHash,
      isActive: true
    }
  });

  await prisma.user.create({
    data: {
      companyId: company.id,
      email: "admin@example.com",
      name: "マネージャー　一郎",
      role: Role.ADMIN,
      passwordHash,
      isActive: true
    }
  });

  await prisma.user.create({
    data: {
      companyId: company.id,
      email: "member@example.com",
      name: "テスト　花子",
      role: Role.MEMBER,
      passwordHash,
      isActive: true
    }
  });

  const SKILL_MASTERS = [
    /* =====================
      Language
    ===================== */
    { category: SkillCategory.LANGUAGE, name: "JavaScript" },
    { category: SkillCategory.LANGUAGE, name: "TypeScript" },
    { category: SkillCategory.LANGUAGE, name: "Java" },
    { category: SkillCategory.LANGUAGE, name: "Kotlin" },
    { category: SkillCategory.LANGUAGE, name: "C#" },
    { category: SkillCategory.LANGUAGE, name: "Python" },
    { category: SkillCategory.LANGUAGE, name: "Go" },
    { category: SkillCategory.LANGUAGE, name: "Ruby" },
    { category: SkillCategory.LANGUAGE, name: "PHP" },
    { category: SkillCategory.LANGUAGE, name: "Swift" },
    { category: SkillCategory.LANGUAGE, name: "Objective-C" },
    { category: SkillCategory.LANGUAGE, name: "Dart" },
    { category: SkillCategory.LANGUAGE, name: "Rust" },
    { category: SkillCategory.LANGUAGE, name: "Scala" },
    { category: SkillCategory.LANGUAGE, name: "Shell Script" },
    { category: SkillCategory.LANGUAGE, name: "PowerShell" },

    /* =====================
      Framework / Library
    ===================== */
    { category: SkillCategory.FRAMEWORK, name: "React" },
    { category: SkillCategory.FRAMEWORK, name: "Next.js" },
    { category: SkillCategory.FRAMEWORK, name: "Vue.js" },
    { category: SkillCategory.FRAMEWORK, name: "Nuxt.js" },
    { category: SkillCategory.FRAMEWORK, name: "Angular" },
    { category: SkillCategory.FRAMEWORK, name: "Svelte" },
    { category: SkillCategory.FRAMEWORK, name: "Spring Boot" },
    { category: SkillCategory.FRAMEWORK, name: "Spring Framework" },
    { category: SkillCategory.FRAMEWORK, name: "Laravel" },
    { category: SkillCategory.FRAMEWORK, name: "Symfony" },
    { category: SkillCategory.FRAMEWORK, name: "Ruby on Rails" },
    { category: SkillCategory.FRAMEWORK, name: "Django" },
    { category: SkillCategory.FRAMEWORK, name: "FastAPI" },
    { category: SkillCategory.FRAMEWORK, name: ".NET Core" },
    { category: SkillCategory.FRAMEWORK, name: "ASP.NET" },
    { category: SkillCategory.FRAMEWORK, name: "Flutter" },
    { category: SkillCategory.FRAMEWORK, name: "React Native" },
    { category: SkillCategory.FRAMEWORK, name: "Electron" },

    /* =====================
      Database
    ===================== */
    { category: SkillCategory.DATABASE, name: "MySQL" },
    { category: SkillCategory.DATABASE, name: "PostgreSQL" },
    { category: SkillCategory.DATABASE, name: "Oracle Database" },
    { category: SkillCategory.DATABASE, name: "SQL Server" },
    { category: SkillCategory.DATABASE, name: "SQLite" },
    { category: SkillCategory.DATABASE, name: "MariaDB" },
    { category: SkillCategory.DATABASE, name: "MongoDB" },
    { category: SkillCategory.DATABASE, name: "Redis" },
    { category: SkillCategory.DATABASE, name: "DynamoDB" },
    { category: SkillCategory.DATABASE, name: "Firestore" },
    { category: SkillCategory.DATABASE, name: "BigQuery" },
    { category: SkillCategory.DATABASE, name: "Elasticsearch" },

    /* =====================
      Cloud / Infra
    ===================== */
    { category: SkillCategory.CLOUD, name: "AWS" },
    { category: SkillCategory.CLOUD, name: "Amazon EC2" },
    { category: SkillCategory.CLOUD, name: "Amazon S3" },
    { category: SkillCategory.CLOUD, name: "Amazon RDS" },
    { category: SkillCategory.CLOUD, name: "AWS Lambda" },
    { category: SkillCategory.CLOUD, name: "AWS ECS" },
    { category: SkillCategory.CLOUD, name: "AWS EKS" },
    { category: SkillCategory.CLOUD, name: "Google Cloud" },
    { category: SkillCategory.CLOUD, name: "Cloud Run" },
    { category: SkillCategory.CLOUD, name: "Cloud Functions" },
    { category: SkillCategory.CLOUD, name: "Firebase" },
    { category: SkillCategory.CLOUD, name: "Microsoft Azure" },
    { category: SkillCategory.CLOUD, name: "Azure App Service" },
    { category: SkillCategory.CLOUD, name: "Azure Functions" },
    { category: SkillCategory.CLOUD, name: "Vercel" },
    { category: SkillCategory.CLOUD, name: "Netlify" },

    /* =====================
      Tools / Others
    ===================== */
    { category: SkillCategory.TOOL, name: "Git" },
    { category: SkillCategory.TOOL, name: "GitHub" },
    { category: SkillCategory.TOOL, name: "GitLab" },
    { category: SkillCategory.TOOL, name: "Bitbucket" },
    { category: SkillCategory.TOOL, name: "Docker" },
    { category: SkillCategory.TOOL, name: "Docker Compose" },
    { category: SkillCategory.TOOL, name: "Kubernetes" },
    { category: SkillCategory.TOOL, name: "Terraform" },
    { category: SkillCategory.TOOL, name: "Ansible" },
    { category: SkillCategory.TOOL, name: "Jenkins" },
    { category: SkillCategory.TOOL, name: "CircleCI" },
    { category: SkillCategory.TOOL, name: "GitHub Actions" },
    { category: SkillCategory.TOOL, name: "Slack" },
    { category: SkillCategory.TOOL, name: "Notion" },
    { category: SkillCategory.TOOL, name: "Jira" },
    { category: SkillCategory.TOOL, name: "Confluence" },
    { category: SkillCategory.TOOL, name: "Figma" },
  ];

  for (const m of SKILL_MASTERS) {
    await prisma.skillMaster.upsert({
      where: { companyId_category_name: { companyId: company.id, category: m.category, name: m.name } },
      create: { ...m, companyId: company.id, isActive: true },
      update: { isActive: true }
    });
  }

  console.log("Seed completed:");
  console.log("Company:", company.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
