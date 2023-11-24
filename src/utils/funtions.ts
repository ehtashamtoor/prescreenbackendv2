import * as bcrypt from 'bcrypt';
import { companyTeamsEnums } from './classes';

export const findDomainFromWebsite = (websiteURL: string) => {
  // Use a regular expression to extract the domain
  const domainMatch = websiteURL.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  // console.log(domainMatch);

  if (
    domainMatch !== null &&
    domainMatch.length > 2 &&
    typeof domainMatch[2] === 'string'
  ) {
    const domain = domainMatch[2];
    // console.log(domain);

    const domainSplit = domain.split('.')[0];

    // console.log('Website Domain:', domainSplit);
    return domainSplit;
  } else {
    // console.log('website must be like https://company.xyz');
    return false;
  }
};

export const findDomainFromEmail = (email: string) => {
  // Use a regular expression to extract the domain
  const domainMatch = email.match(/@([^.]+)/);

  if (
    domainMatch !== null &&
    domainMatch.length > 1 &&
    typeof domainMatch[1] === 'string'
  ) {
    const domain = domainMatch[1];

    // console.log('Email Domain:', domain);
    return domain;
  } else {
    // console.log('Domain not found in the email address.');
    return 0;
  }
};

export const getNormalDate = (date: Date) => {
  const dateFormat = new Date(date);
  const month = dateFormat.getMonth();
  const day = dateFormat.getDate();
  const year = dateFormat.getFullYear();

  // console.log(month, day, year);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const normalDate = `${months[month]} ${day}, ${year}`;
  return normalDate;
};

// FUNCTION to generate 6 digit random OTP
export const generateRandom5DigitOTP = async () => {
  const min = 100000;
  const max = 999999;
  const normalOtp = `${Math.floor(Math.random() * (max - min + 1)) + min}`;
  const saltRounds = 10;
  const hashedOTP = await bcrypt.hash(normalOtp, saltRounds);
  console.log(normalOtp);
  return { normalOtp, hashedOTP };
};

export const getQuestionCounts = (mcqs: any[]) => {
  let generalCount = 0;
  mcqs.map((question: any) => {
    if (question) {
      generalCount++;
    }
  });
  return generalCount;
};

export const getupdatedTestsAllowed = (tests: any, feature: any) => {
  let generalCount = feature.featuresUsed.testsUsed;
  if (tests) {
    generalCount++;
  }
  return generalCount;
};

export const getupdatedJobsAllowed = (jobs: any, feature: any) => {
  let generalCount = feature.featuresUsed.jobsUsed;
  if (jobs) {
    generalCount++;
  }
  return generalCount;
};

export const calculateTotalQuestions = (obj1: any, obj2: any) => {
  let total = 0;

  for (const difficulty in obj1) {
    if (obj1.hasOwnProperty(difficulty)) {
      total += obj1[difficulty];
    }
  }

  for (const difficulty in obj2) {
    if (obj2.hasOwnProperty(difficulty)) {
      total += obj2[difficulty];
    }
  }

  return total;
};

export const checkUser = (
  userType: string,
  companyId: string,
  userid: string,
) => {
  const validUserTypes = Object.values(companyTeamsEnums);
  if (validUserTypes.includes(userType)) {
    console.log('Setting company ID from team model');
    const userid = companyId;
    return userid;
  }
  return userid;
};

// export const getupdateExamQuestions = (exams: any, feature: any) => {
//   let generalCount = feature.featuresUsed.examsUsed.general;
//   let privateCount = feature.featuresUsed.examsUsed.private;
//   if (exams.examType === 'general') {
//     generalCount++;
//   } else if (exams.examType === 'private') {
//     privateCount++;
//   }
//   // console.log('generalCount>', generalCount, 'privateCount:', privateCount);
//   return { generalCount, privateCount };
// };
