import type { Batch, LinkedInPost, Speaker, Testimonial, WebsiteSettings } from "@/lib/types";

const now = "2026-09-20T11:15:01.468Z";

export const SEED_BATCHES: Batch[] = [
  {
    id: "batch-05",
    batch_number: "Batch #05",
    name: "Batch 05 Masterclass Cohort",
    start_date: "1 October 2026",
    end_date: "6 October 2026",
    start_at: "2026-10-01T09:00:00+05:30",
    end_at: "2026-10-06T21:00:00+05:30",
    registration_deadline: "30 September 2026, 11:59 PM",
    registration_deadline_at: "2026-09-30T23:59:00+05:30",
    fee: 999,
    whatsapp_link: "https://chat.whatsapp.com/BeAGTr1Q7t63W8PBqXxnS5",
    drive_folder_id: "1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD",
    drive_folder_url: "https://drive.google.com/drive/folders/1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD",
    session_info:
      "Live sessions run across six days. Daily Zoom links, CV review slots, and announcements are shared in your batch WhatsApp group.",
    max_seats: 100,
    seats_booked: 96,
    status: "active",
    description:
      "The premier 6-day live cohort for CA students targeting Big 4, Big 6 and premier firms with mock interviews and live feedback.",
    created_at: now,
    updated_at: now,
  },
  {
    id: "batch-06",
    batch_number: "Batch #06",
    name: "Batch 06 Masterclass Cohort",
    start_date: "15 October 2026",
    end_date: "20 October 2026",
    start_at: "2026-10-15T09:00:00+05:30",
    end_at: "2026-10-20T21:00:00+05:30",
    registration_deadline: "14 October 2026, 11:59 PM",
    registration_deadline_at: "2026-10-14T23:59:00+05:30",
    fee: 999,
    whatsapp_link: "https://chat.whatsapp.com/K8JmL9N5w034YyExampleB06",
    drive_folder_id: "1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD",
    drive_folder_url: "https://drive.google.com/drive/folders/1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD",
    session_info:
      "Live sessions run across six days. Daily Zoom links, CV review slots, and announcements are shared in your batch WhatsApp group.",
    max_seats: 100,
    seats_booked: 14,
    status: "upcoming",
    description: "Upcoming cohort designed for students gearing up for articleship recruitment drives in Q4 2026.",
    created_at: now,
    updated_at: now,
  },
];

export const SEED_SETTINGS: WebsiteSettings = {
  hero_headline: "Your Articleship Search Needs More Than Just a CV.",
  hero_subtitle:
    "A practical 6-day masterclass to help you approach your CA articleship search with the right CV, strategy, communication and interview preparation.",
  statistics: [
    {
      id: "stat-1",
      number: "500+",
      title: "Students Placed",
      description:
        "500+ students have secured articleship opportunities through the guidance and support provided by Umbrella Network.",
      order: 1,
      visible: true,
    },
    {
      id: "stat-2",
      number: "100%",
      title: "Big 6 Interview Opportunities",
      description:
        "100% of students in the relevant tracked cohort received at least one interview opportunity from Big 6 firms.",
      order: 2,
      visible: true,
    },
    {
      id: "stat-3",
      number: "6 Days",
      title: "Practical Masterclass",
      description:
        "A structured 6-day program focused on articleship applications, CVs, domains, interviews and career preparation.",
      order: 3,
      visible: true,
    },
  ],
  pricing: {
    fee: 999,
    title: "Articleship Masterclass",
    duration: "6-Day Intensive Masterclass",
    refund_policy_note:
      "Fees once paid are non-refundable as cohort seats are limited and materials are shared upon registration.",
    certificate_included: true,
  },
  mentor: {
    name: "CA Harsh Kaushik",
    title: "Chartered Accountant | Articleship & Career Mentor",
    quote:
      "I created this masterclass because I remember how confusing the articleship search can be when you don't know where to start, how to approach firms, or how to present yourself.",
    credentials: [
      "Qualified CA in first attempt",
      "Articleship at PwC",
      "Industrial Training at Flipkart",
      "Former Assistant Manager at Deloitte",
    ],
    linkedin_url: "https://www.linkedin.com/in/ca-harsh-kaushik/",
    image_url: "/ca-harsh.jpg",
  },
  contact: {
    email: "caumbrellanetwork@gmail.com",
    phone: "+91 9996506041",
    whatsapp_general:
      "https://wa.me/919996506041?text=Hi%2C%20I%20have%20a%20query%20regarding%20the%20CA%20Articleship%20Masterclass",
    linkedin: "https://www.linkedin.com/in/ca-harsh-kaushik/",
  },
  faqs: [
    {
      question: "Who is this masterclass for?",
      answer:
        "CA students looking for articleship opportunities, especially CA Inter cleared students and students targeting reputed firms like Big 4, Big 6, top mid-size and consulting firms.",
    },
    {
      question: "Is this only for Big 4 aspirants?",
      answer:
        "No. The framework is relevant to students targeting Big 4, Big 6, reputed mid-size firms, consulting firms, corporate finance divisions, and other specialized organizations.",
    },
    {
      question: "How long is the masterclass?",
      answer:
        "The masterclass spans 6 structured, live interactive days with practical frameworks, mock interview practice, and actionable strategy sessions.",
    },
    {
      question: "What is the fee?",
      answer: "₹999 for the current batch. All masterclass sessions, templates, CV frameworks, and batch access are included without hidden fees.",
    },
    {
      question: "Will I get a WhatsApp group?",
      answer: "Yes. Immediately after successful registration, you receive the exclusive WhatsApp group link dedicated solely to your registered batch.",
    },
    {
      question: "Are placements guaranteed?",
      answer:
        "No. The masterclass provides guidance, preparation, frameworks, and curated resources but does not guarantee an articleship offer. Results depend on individual capability, preparation, and market openings.",
    },
    {
      question: "Are interviews guaranteed?",
      answer:
        "No. Historical outcomes (like 100% Big 6 interview opportunities in the tracked cohort) are historical results and do not guarantee future interview opportunities.",
    },
    {
      question: "Is the payment refundable?",
      answer:
        "Due to limited batch capacity and immediate allocation of batch resources, fees are non-refundable unless a batch is cancelled by Umbrella Network.",
    },
    {
      question: "Will I receive a certificate of completion?",
      answer:
        "Yes, active participants who complete the 6-day masterclass and submit their CV & practical assignment receive a certificate of completion.",
    },
  ],
};

export const SEED_SPEAKERS: Speaker[] = [
  {
    id: "spk-1",
    name: "Vanshika Nihalani",
    firm: "Deloitte",
    domain: "Statutory Audit",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    description: "Secured Statutory Audit articleship at Deloitte; shares practical guidance on cracking Big 4 technical & managerial rounds.",
    linkedin_url: "https://www.linkedin.com/in/vanshika-nihalani0703/",
    status: "active",
  },
  {
    id: "spk-2",
    name: "Disha Pahwa",
    firm: "BDO",
    domain: "Statutory Audit",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    description: "Secured articleship at BDO in Statutory Audit; mentors students on structured resume building and first impressions.",
    linkedin_url: "https://www.linkedin.com/in/disha-pahwa-5155573b4/",
    status: "active",
  },
  {
    id: "spk-3",
    name: "Nitish Thawani",
    firm: "BDO",
    domain: "Statutory Audit",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    description: "Articleship at BDO; guides on technical questions, Ind AS fundamentals, and audit interview questions.",
    linkedin_url: "https://www.linkedin.com/in/nitishthawani01/",
    status: "active",
  },
  {
    id: "spk-4",
    name: "Faizal",
    firm: "EY",
    domain: "Direct Tax",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    description: "Direct Tax articleship at EY; shares strategies on answering tax case studies and HR interview questions.",
    linkedin_url: "https://www.linkedin.com/in/md-f-37359a36b/",
    status: "active",
  },
  {
    id: "spk-5",
    name: "Gitanjali Joshi",
    firm: "BDO",
    domain: "M&A Tax",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    description: "M&A Tax at BDO; helps students navigate niche domain selection, firm cultures, and strategic networking.",
    linkedin_url: "https://www.linkedin.com/in/gitanjali-joshi-58b9b5213/",
    status: "active",
  },
  {
    id: "spk-6",
    name: "Sparsh Garg",
    firm: "EY",
    domain: "Internal Audit",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    description: "Internal Audit at EY; guides candidates through risk consulting interview structures and group discussions.",
    linkedin_url: "https://www.linkedin.com/in/sparsh-garg-a52418327/",
    status: "active",
  },
  {
    id: "spk-7",
    name: "Sujal Agarwal",
    firm: "BDO",
    domain: "Accounting",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    description: "Accounting & Advisory at BDO; covers practical Excel skills, accounting standards, and cold emailing strategies.",
    linkedin_url: "https://www.linkedin.com/in/sujalagarwal07/",
    status: "active",
  },
];

export const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    student_name: "Chetan Patil",
    designation: "Articleship Trainee",
    firm: "PwC",
    domain: "Statutory Audit",
    testimonial:
      "Before joining Umbrella Network, I sent out 40+ CVs with zero responses. Harsh bhaiya helped me restructure my CV around specific audit keywords and taught me how to write impactful emails. Within 2 weeks, I had interview calls from 2 Big 4s and converted PwC.",
    status: "published",
    created_at: now,
  },
  {
    id: "test-2",
    student_name: "Om Shukla",
    designation: "Articleship Trainee",
    firm: "Deloitte",
    domain: "Stat Audit",
    testimonial:
      "The domain comparison matrix and mock interview feedback were gold. In college, no one tells you the real difference between internal audit, stat audit, and risk advisory. This masterclass gave me clarity and confidence.",
    status: "published",
    created_at: now,
  },
  {
    id: "test-3",
    student_name: "Sneha Solanki",
    designation: "Articleship Trainee",
    firm: "EY",
    domain: "Direct Tax",
    testimonial:
      "The Excel session alone saved me hundreds of hours. The 6-day roadmap broke down the daunting articleship search into manageable daily steps. Highly recommended for every CA Inter student.",
    status: "published",
    created_at: now,
  },
];

export const SEED_LINKEDIN_POSTS: LinkedInPost[] = [];
