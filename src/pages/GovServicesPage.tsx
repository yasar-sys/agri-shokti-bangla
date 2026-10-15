import { ArrowLeft, Landmark, CreditCard, Shield, Users, ExternalLink, Phone, FileText, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import villageBg from "@/assets/bangladesh-village-bg.jpg";

const subsidyPrograms = [
  {
    title: "কৃষি উপকরণ ভর্তুকি",
    description: "সার, বীজ, কীটনাশকে সরকারি ভর্তুকি",
    link: "https://moa.gov.bd",
    icon: Landmark,
  },
  {
    title: "কৃষি কার্ড প্রকল্প",
    description: "কৃষি কার্ডের যোগ্যতা ও চলমান সহায়তার তথ্য",
    link: "https://dae.gov.bd",
    icon: CreditCard,
  },
  {
    title: "কৃষি যান্ত্রিকীকরণ",
    description: "কৃষি যন্ত্রপাতির চলমান ভর্তুকি ও আবেদন নির্দেশনা",
    link: "https://dae.gov.bd",
    icon: FileText,
  },
];

const loanPrograms = [
  {
    title: "কৃষি ঋণ - বাংলাদেশ ব্যাংক",
    description: "চলমান কৃষি ঋণের সুদ, সীমা ও যোগ্যতা ব্যাংক থেকে নিশ্চিত করুন",
    phone: "16236",
    requirements: "জমির দলিল, NID, কৃষক কার্ড",
  },
  {
    title: "রাজশাহী কৃষি উন্নয়ন ব্যাংক",
    description: "শস্য ঋণের সুদ ও মেয়াদ সংশ্লিষ্ট শাখা থেকে নিশ্চিত করুন",
    phone: "02-8432441",
    requirements: "জমির দলিল, ওয়ারিশ সনদ",
  },
  {
    title: "গ্রামীণ ব্যাংক কৃষি ঋণ",
    description: "ক্ষুদ্র কৃষকদের জন্য জামানতবিহীন ঋণ",
    phone: "02-8411913",
    requirements: "সদস্য হতে হবে",
  },
];

const insuranceInfo = [
  {
    title: "শস্য বীমা প্রকল্প",
    description: "প্রাকৃতিক দুর্যোগে ক্ষতিপূরণ পান",
    premium: "প্রিমিয়াম: বীমাকারীর বর্তমান শর্ত অনুযায়ী",
    coverage: "কভারেজ: বীমার চুক্তি অনুযায়ী",
  },
  {
    title: "গবাদি পশু বীমা",
    description: "গরু, ছাগল, মুরগির মৃত্যুতে ক্ষতিপূরণ",
    premium: "প্রিমিয়াম: বীমাকারীর বর্তমান শর্ত অনুযায়ী",
    coverage: "কভারেজ: বীমার চুক্তি অনুযায়ী",
  },
];

export default function GovServicesPage() {
  return (
    <div className="min-h-screen pb-24 relative">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${villageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <Link
          to="/home"
          className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">সরকারি সেবা</h1>
          <p className="text-xs text-muted-foreground">ভর্তুকি, ঋণ ও বীমা তথ্য</p>
        </div>
      </header>

      {/* Subsidy Programs */}
      <section className="px-4 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-primary" />
          কৃষি ভর্তুকি প্রকল্প
        </h2>
        <div className="space-y-2">
          {subsidyPrograms.map((program, index) => (
            <a
              key={index}
              href={program.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <program.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{program.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Loan Programs */}
      <section className="px-4 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-secondary" />
          কৃষি ঋণ তথ্য
        </h2>
        <div className="space-y-2">
          {loanPrograms.map((loan, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-4"
            >
              <h3 className="font-medium text-foreground mb-1">{loan.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{loan.description}</p>
              <div className="flex items-center gap-4 text-xs">
                <a href={`tel:${loan.phone}`} className="flex items-center gap-1 text-secondary">
                  <Phone className="w-3 h-3" />
                  {loan.phone}
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                📋 প্রয়োজনীয় কাগজ: {loan.requirements}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Insurance */}
      <section className="px-4 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-chart-3" />
          কৃষি বীমা
        </h2>
        <div className="space-y-2">
          {insuranceInfo.map((insurance, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-4"
            >
              <h3 className="font-medium text-foreground mb-1">{insurance.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{insurance.description}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                  {insurance.premium}
                </span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {insurance.coverage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Buyer Contacts */}
      <section className="px-4 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-chart-4" />
          সরাসরি ক্রেতা যোগাযোগ
        </h2>
        <Link to="/portal" className="block border border-border rounded-lg p-4 text-primary">
          কৃষক ও ক্রেতার পোর্টাল <ExternalLink className="inline w-4 h-4 ml-2" />
        </Link>
      </section>

      {/* Helpline */}
      <section className="px-4">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-border rounded-xl p-4 text-center">
          <p className="text-sm text-foreground mb-2">🆘 কৃষি কল সেন্টার</p>
          <a href="tel:16123" className="text-2xl font-bold text-secondary">
            ১৬১২৩
          </a>
          <p className="text-xs text-muted-foreground mt-1">সেবার সময় ও কলচার্জ অপারেটরের কাছে নিশ্চিত করুন</p>
        </div>
      </section>
    </div>
  );
}
