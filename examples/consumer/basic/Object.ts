import { data2Description } from "@furyjs/fury/dist/lib/util";

export const sample = {
  id: 123456,
  name: "John Doe",
  email: "johndoe@example.com",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "98765"
  },
  phoneNumbers: [
    {
      type: "home",
      number: "555-1234"
    },
    {
      type: "work",
      number: "555-5678"
    }
  ],
  isMarried: true,
  hasChildren: false,
  interests: [
    "reading",
    "hiking",
    "cooking",
    "swimming",
    "painting",
    "traveling",
    "photography",
    "playing music",
    "watching movies",
    "learning new things",
    "spending time with family and friends"
  ],
  education: [
    {
      degree: "Bachelor of Science",
      major: "Computer Science",
      university: "University of California, Los Angeles",
      graduationYear: 2012
    },
    {
      degree: "Master of Business Administration",
      major: "Marketing",
      university: "Stanford University",
      graduationYear: 2016
    }
  ],
  workExperience: [
    {
      company: "Google",
      position: "Software Engineer",
      startDate: "2012-06-01",
      endDate: "2014-08-31"
    },
    {
      company: "Apple",
      position: "Product Manager",
      startDate: "2014-09-01",
      endDate: "2018-12-31"
    },
    {
      company: "Amazon",
      position: "Senior Product Manager",
      startDate: "2019-01-01",
      endDate: "2018-12-31"
    }
  ],
  selfIntroduction: `Hi, my name is John Doe and I am a highly motivated and driven individual with a passion for excellence in all areas of my life. I have a diverse background and have gained valuable experience in various fields such as software engineering, product management, and marketing.
  I am a graduate of the University of California, Los Angeles where I received my Bachelor of Science degree in Computer Science. After graduation, I joined Google as a software engineer where I worked on developing innovative products that revolutionized the way people interact with technology.
  With a desire to broaden my skillset, I pursued a Master of Business Administration degree in Marketing from Stanford University. There, I gained a deep understanding of consumer behavior and developed the ability to effectively communicate complex ideas to various stakeholders.
  After completing my MBA, I joined Apple as a product manager where I led the development of several successful products and played a key role in the company's growth. Currently, I am working as a Senior Product Manager at Amazon, where I am responsible for managing a team of product managers and developing cutting-edge products that meet the needs of our customers.
  Aside from my professional life, I am an avid reader, hiker, and cook. I enjoy spending time with my family and friends, learning new things, and traveling to new places. I believe that success is a journey, not a destination, and I am committed to continuously improving myself and achieving excellence in all that I do.
  `
};

export function genDescription() {
  return data2Description(sample, "test.js-noomi-rpc");
}
