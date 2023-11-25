import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CandidateAssessment } from './entities/candidate-assessment.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateCandidateAssessmentDto } from './dto/create-candidate-assessment.dto';
import { MCQ } from 'src/mcq/entities/mcq.entity';
import { CodingQuestion } from 'src/coding-question/entities/coding-question.entity';
import axios from 'axios';

@Injectable()
export class CandidateAssessmentService {
  constructor(
    @InjectModel(CandidateAssessment.name)
    private AssessmentModel: Model<CandidateAssessment>,
    @InjectModel(MCQ.name)
    private McqModel: Model<MCQ>,
    @InjectModel(CodingQuestion.name)
    private CodingModel: Model<CodingQuestion>,
  ) {}

  async create(
    dto: CreateCandidateAssessmentDto,
    userId: string,
    mcqs: any[],
    codings: any[],
  ) {
    // console.log(dto);

    // Create a new CandidateAssessment entity
    const candidateAssessment = new this.AssessmentModel({
      candidate: userId,
      exam: dto.exam,
      codings,
      mcqs: mcqs,
      job: dto.job,
    });

    // Save the candidateAssessment entity
    await candidateAssessment.save();

    // now find that doc and return
    const foundAssessment = await this.AssessmentModel.findOne({
      candidate: userId,
      exam: dto.exam,
    })
      .populate({
        path: 'mcqs',
        select: '_id title options',
      })
      .populate({
        path: 'codings',
        select: '_id title description templates',
      });

    if (!foundAssessment) {
      throw new NotFoundException('No assessment found');
    }

    // console.log(foundAssessment);
    return foundAssessment;
  }

  async findAll(page?: number, limit?: number) {
    let result;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.AssessmentModel.aggregate([
        {
          $facet: {
            assessments: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.AssessmentModel.aggregate([
        {
          $facet: {
            assessments: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const assessments = result[0].assessments;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      assessments: assessments,
      total: totalDocs,
    };
  }

  async findByExamId(examId: string, page?: number, limit?: number) {
    let result;
    const matchStage: any = {
      exam: new mongoose.Types.ObjectId(examId),
    };

    const lookup1 = {
      $lookup: {
        from: 'users', // collection named from which lookup
        localField: 'candidate', // collection field to be lookup from other
        foreignField: '_id',
        as: 'candidateInfo',
        pipeline: [{ $project: { name: 1, email: 2 } }], // fields to populate
      },
    };
    const lookup2 = {
      $lookup: {
        from: 'exams',
        localField: 'exam',
        foreignField: '_id',
        as: 'examInfo',
        pipeline: [{ $project: { title: 1 } }],
      },
    };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.AssessmentModel.aggregate([
        {
          $facet: {
            assessments: [
              { $match: matchStage },
              lookup1,
              lookup2,
              { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.AssessmentModel.aggregate([
        {
          $facet: {
            assessments: [{ $match: matchStage }, lookup1, lookup2],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    }

    const assessments = result[0].assessments;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      assessments: assessments,
      total: totalDocs,
    };
  }

  async findByExamsWithPagination(exams: any[], page?: number, limit?: number) {
    let assessments: any = [];
    let totalDocs = 0;
    const lookup1 = {
      $lookup: {
        from: 'users', // collection named from which lookup
        localField: 'candidate', // collection field to be lookup from other
        foreignField: '_id',
        as: 'candidateInfo',
        pipeline: [{ $project: { name: 1, email: 2 } }],
      },
    };
    const lookup2 = {
      $lookup: {
        from: 'exams',
        localField: 'exam',
        foreignField: '_id',
        as: 'examInfo',
        pipeline: [{ $project: { title: 1 } }],
      },
    };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      for (const exam of exams) {
        const examId = new mongoose.Types.ObjectId(exam._id);

        const matchStage: any = {
          exam: {
            $in: [examId],
          },
        };

        const result = await this.AssessmentModel.aggregate([
          {
            $facet: {
              assessments: [
                { $match: matchStage },
                lookup1,
                lookup2,
                { $skip: skip },
                { $limit: +limit },
              ],
              totalDocs: [{ $match: matchStage }, { $count: 'count' }],
            },
          },
        ]);

        assessments = assessments.concat(result[0].assessments);
        totalDocs +=
          result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
      }
    }

    return {
      allAssessments: assessments,
      total: totalDocs,
    };
  }

  async findByExams(exams: any[]) {
    let assessments: any = [];
    let totalDocs = 0;
    const lookup1 = {
      $lookup: {
        from: 'users', // collection named from which lookup
        localField: 'candidate', // collection field to be lookup from other
        foreignField: '_id',
        as: 'candidateInfo',
        pipeline: [{ $project: { name: 1, email: 2 } }],
      },
    };
    const lookup2 = {
      $lookup: {
        from: 'exams',
        localField: 'exam',
        foreignField: '_id',
        as: 'examInfo',
        pipeline: [{ $project: { title: 1 } }],
      },
    };

    for (const exam of exams) {
      const examId = new mongoose.Types.ObjectId(exam._id);

      const matchStage: any = {
        exam: {
          $in: [examId],
        },
      };

      const result = await this.AssessmentModel.aggregate([
        {
          $facet: {
            assessments: [{ $match: matchStage }, lookup1, lookup2],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);

      assessments = assessments.concat(result[0].assessments);
      totalDocs +=
        result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
    }

    return {
      allAssessments: assessments,
      total: totalDocs,
    };
  }

  async findTestByCandidate(userId: string, page?: number, limit?: number) {
    let result;
    const matchStage: any = {
      candidate: new mongoose.Types.ObjectId(userId),
      'testPointer.isFinished': true,
    };
    const lookup = {
      $lookup: {
        from: 'exams', // collection named from which lookup
        localField: 'exam', // collection field to be lookup from other
        foreignField: '_id',
        as: 'examInfo',
      },
    };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.AssessmentModel.aggregate([
        {
          $facet: {
            applications: [
              { $match: matchStage },
              lookup,
              { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.AssessmentModel.aggregate([
        {
          $facet: {
            applications: [{ $match: matchStage }, lookup],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    }

    const applications = result[0].applications;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      applications: applications,
      total: totalDocs,
    };
  }

  async testResult(id: string) {
    return this.AssessmentModel.findById(id);
  }

  findOne(id: string) {
    return this.AssessmentModel.findById(id);
  }

  async update(userId: string, examId: string, dto: any) {
    // Calculate percentage
    function calculatePercentage(candidateAssessment: any) {
      const totalMCQs = candidateAssessment.mcqs.length;
      const totalCodings = candidateAssessment.codings.length;
      const totalPossiblePoints = totalMCQs + totalCodings;

      const pointsEarned = candidateAssessment.testPointer.points;
      const percentage = (pointsEarned / totalPossiblePoints) * 100;

      return percentage;
    }
    // Find the CandidateAssessment by exam ID and candidate userId
    const candidateAssessment = await this.AssessmentModel.findOne({
      exam: examId,
      candidate: userId,
    })
      .populate({
        path: 'mcqs',
        select: '_id options title',
      })
      .populate({
        path: 'codings',
        select: '_id title description templates',
      })
      .populate({
        path: 'mcqQuestions.questionId',
        select: 'correctOption',
      });

    // console.log('candidateAssessment', candidateAssessment);

    if (!candidateAssessment) {
      throw new NotFoundException(
        `CandidateAssessment with exam ID ${examId} not found`,
      );
    }

    const { testPointer } = candidateAssessment;
    // Get the current index from the testPointer
    let currentIndex = testPointer.index;

    let nextQuestion;

    // console.log('testpointer', testPointer);

    // Save the answer to the respective array based on activeMcqs or activeCoding
    if (testPointer.activeMcqs == true) {
      // check answer of mcq to the correct options
      // get mcq from bank to check
      const mcq = await this.McqModel.findById(
        dto.question.questionId,
      ).populate('correctOption');
      // console.log(mcq?.correctOption);

      // now check and set

      if (mcq) {
        const isCorrect = mcq.correctOption === dto.question.answer;
        // console.log(isCorrect);
        // Add the question to mcqQuestions with the correct property
        const mcqQuestion = {
          questionId: mcq._id,
          answer: dto.question.answer,
          correct: isCorrect, // Set correct based on the comparison
        };
        // call percentage function
        const percentage = calculatePercentage(candidateAssessment);
        // console.log("Candidate Percentage:", percentage);
        candidateAssessment.testPointer.obtainPercentage = percentage;

        candidateAssessment.mcqQuestions = [
          ...candidateAssessment.mcqQuestions,
          mcqQuestion,
        ];

        // Update points if the answer is correct
        if (isCorrect) {
          candidateAssessment.testPointer.points += 1;
        }
      }
    } else if (testPointer.activeCoding == true) {
      // code for compiler results
      // get coding question from question id
      // console.log(dto.question.questionId);
      const question = await this.CodingModel.findById(dto.question.questionId);
      // // console.log("dto.question.questionId", dto.question.questionId);
      // // console.log('question', question);
      if (!question) {
        throw new NotFoundException('Question not found');
      }
      // just save the answer into codingQuestions array
      const codingQuestion = {
        questionId: question._id,
        answer: dto.question.answer,
        correct: false,
      };
      candidateAssessment.codingQuestions = [
        ...candidateAssessment.codingQuestions,
        codingQuestion,
      ];
    }

    // check for time if time is reached then END paper
    if (testPointer.totalTime - dto.remainingTime >= testPointer.totalTime) {
      testPointer.index = 0;
      testPointer.activeCoding = false;
      testPointer.activeMcqs = false;
      testPointer.isFinished = true;
      testPointer.totalTime = 0;
      testPointer.remainingTime = 0;
      // Save the updated CandidateAssessment entity
      await candidateAssessment.save();

      return {
        isFinished: true,
      };
    }
    // console.log("testPointer", testPointer);

    // now to send next question
    if (testPointer.activeMcqs) {
      // if length exceeds then move to coding question array
      if (currentIndex >= candidateAssessment.mcqs.length) {
        // check if there is coding questions then send wrna end exam
        if (candidateAssessment.codings.length == 0) {
          testPointer.index = 0;
          testPointer.activeCoding = false;
          testPointer.activeMcqs = false;
          testPointer.isFinished = true;
          testPointer.totalTime = 0;
          testPointer.remainingTime = 0;
          // Save the updated CandidateAssessment entity
          await candidateAssessment.save();
          return {
            isFinished: true,
          };
        }
        testPointer.index = 0;
        testPointer.activeCoding = true;
        testPointer.activeMcqs = false;
        testPointer.isFinished = false;
        // testPointer.totalTime = 0;

        // get first question from codings array and send to user
        currentIndex = 0;
        nextQuestion = candidateAssessment.codings[currentIndex];
        testPointer.index += 1;
        testPointer.remainingTime = dto.remainingTime;

        // console.log(candidateAssessment.codings);
        // console.log('This is next question.....', nextQuestion);

        // Save the updated CandidateAssessment entity
        await candidateAssessment.save();
        console.log('first se gya mcqs response....', nextQuestion);
        return {
          question: nextQuestion,
          isFinished: false,
          isCodingQuestion: true,
        };
      }

      nextQuestion = candidateAssessment.mcqs[currentIndex];
      testPointer.index += 1;
      testPointer.remainingTime = dto.remainingTime;
      // Save the updated CandidateAssessment entity
      await candidateAssessment.save();
      console.log('second se gya response....', nextQuestion);
      return {
        question: nextQuestion,
        isCodingQuestion: false,
        isFinished: false,
      };
    } else if (testPointer.activeCoding) {
      // if coding array length reaches, end paper
      if (currentIndex >= candidateAssessment.codings.length) {
        // loop through candidateAssessment.codingQuestions, from in it get question from db, call compiler with answer, and if true then update array with that question and set correct = true otherwise correct = false

        const updatedQuestions = await Promise.all(
          candidateAssessment.codingQuestions.map(async (question) => {
            const questionFound = await this.CodingModel.findById(
              question.questionId,
            );

            if (!questionFound) {
              throw new NotFoundException('Coding Question not found');
            }

            // convert question into desired format
            function transformData(originalData: any, dto: any) {
              const organizedData = {
                test: '1',
                language: questionFound?.language,
                executionMode: 'code',
                code: dto.answer,
                // code: dto.question.answer.replace(/<p>|<\/p>/g, ''),
                stdin: '',
                args: '',
                functionName: originalData.functionName,
                testCases: originalData.testCases.map((testCase: any) => ({
                  input: JSON.parse(testCase.input),
                  output: testCase.output,
                })),
              };
              return organizedData;
            }

            const transformedData = transformData(questionFound, question);
            console.log('transform data', transformedData);
            //api call from compiler for result
            try {
              console.log('enter in try', process.env.COMPILER_LINK )
              const response = await axios.post(
                `${process.env.COMPILER_LINK}`,
                transformedData,
              );
              console.log('compiler result:', response.data);
              if (response.data.stdout == true) {
                const codingQuestion = {
                  questionId: question.questionId,
                  answer: question.answer,
                  correct: true,
                };
                // candidateAssessment.codingQuestions[index] = codingQuestion;
                // console.log(candidateAssessment.codingQuestions[index]);
                candidateAssessment.testPointer.points += 1;
                // TODO marks on basis of difficulty level
                // if ((question.difficultyLevel = "easy")) {
                //   candidateAssessment.testPointer.points += 0.5;
                // } else if ((question.difficultyLevel = "medium")) {
                //   candidateAssessment.testPointer.points += 1;
                // } else if ((question.difficultyLevel = "hard")) {
                //   candidateAssessment.testPointer.points += 3;
                // }
                // candidateAssessment.testPointer.points += 1;
                // call percentage function
                const percentage = calculatePercentage(candidateAssessment);
                candidateAssessment.testPointer.obtainPercentage = percentage;
                return codingQuestion;
                // await candidateAssessment.save();
              } else if (response.data.stdout == false) {
                const codingQuestion = {
                  questionId: question.questionId,
                  answer: question.answer,
                  correct: false,
                };
                return codingQuestion;
              }
              // console.log('in try last', response.data);
            } catch (error) {
              console.log('catch', error);
              throw new InternalServerErrorException(error);
            }
          }),
        );
        // console.log('updated questions are', updatedQuestions);
        candidateAssessment.codingQuestions = updatedQuestions as {
          questionId: string;
          answer: string;
          correct?: boolean;
        }[];

        // now ending the paper
        testPointer.index = 0;
        testPointer.activeCoding = false;
        testPointer.activeMcqs = false;
        testPointer.isFinished = true;
        testPointer.totalTime = 0;
        testPointer.remainingTime = 0;
        // Save the updated CandidateAssessment entity
        await candidateAssessment.save();
        // console.log(candidateAssessment.codingQuestions);

        return {
          isFinished: true,
        };
      }
      currentIndex = testPointer.index;
      nextQuestion = candidateAssessment.codings[currentIndex];
      testPointer.index += 1;
      testPointer.remainingTime = dto.remainingTime;
      // Save the updated CandidateAssessment entity
      await candidateAssessment.save();
      console.log('third se gya response....', nextQuestion);
      return {
        question: nextQuestion,
        isCodingQuestion: true,
        isFinished: false,
      };
    } else {
      testPointer.index = 0;
      testPointer.activeCoding = false;
      testPointer.activeMcqs = false;
      testPointer.isFinished = true;
      testPointer.totalTime = 0;
      testPointer.remainingTime = 0;
      // Save the updated CandidateAssessment entity
      await candidateAssessment.save();
      return {
        isFinished: true,
      };
    }
  }

  async checkProgress(assessmentId: string) {
    // Find the assessment based on the provided ID
    const assessment = await this.AssessmentModel.findById(assessmentId)
      .populate({
        path: 'mcqs',
        select: '_id options title',
      })
      .populate({
        path: 'codings',
        select: '_id title description templates',
      })
      .populate({
        path: 'mcqQuestions.questionId',
        select: 'correctOption',
      });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    // Check if the assessment is finished
    if (assessment.testPointer.isFinished) {
      return { isFinished: true };
    }

    // Check if the number of attempts is greater than 2
    if (assessment.testPointer.attempts > 2) {
      // Finish the test
      assessment.testPointer.index = 0;
      assessment.testPointer.activeCoding = false;
      assessment.testPointer.activeMcqs = false;
      assessment.testPointer.isFinished = true;
      assessment.testPointer.totalTime = 0;
      assessment.testPointer.remainingTime = 0;

      // Save the updated assessment
      await assessment.save();

      return { isFinished: true };
    }

    // Determine whether to send an MCQ or a coding question based on the testPointer
    let nextQuestion;
    let currentIndex;
    if (assessment.testPointer.activeMcqs) {
      // Get the next MCQ question
      // if index is 0 then send question at index 0, else send question at previous index
      if (assessment.testPointer.index == 0) {
        currentIndex = assessment.testPointer.index;
      } else {
        currentIndex = assessment.testPointer.index - 1;
      }

      nextQuestion = assessment.mcqs[currentIndex];
      // Increment the attempts
      assessment.testPointer.attempts++;

      // Increment the index for the next question
      assessment.testPointer.index = currentIndex + 1;

      // Save the updated assessment
      await assessment.save();
      return {
        question: nextQuestion,
        isCodingQuestion: false,
        isFinished: false,
      };
    } else if (assessment.testPointer.activeCoding) {
      // Get the next coding question
      // if index is 0 then send question at index 0, else send question at previous index
      if (assessment.testPointer.index == 0) {
        currentIndex = assessment.testPointer.index;
      } else {
        currentIndex = assessment.testPointer.index - 1;
      }
      nextQuestion = assessment.codings[currentIndex];
      // Increment the attempts
      assessment.testPointer.attempts++;

      // Increment the index for the next question
      assessment.testPointer.index = currentIndex + 1;

      // Save the updated assessment
      await assessment.save();
      return {
        question: nextQuestion,
        isCodingQuestion: true,
        isFinished: false,
      };
    }

    // If there are no more questions, finish test
    assessment.testPointer.index = 0;
    assessment.testPointer.activeCoding = false;
    assessment.testPointer.activeMcqs = false;
    assessment.testPointer.isFinished = true;
    assessment.testPointer.totalTime = 0;
    assessment.testPointer.remainingTime = 0;

    // Save the updated assessment
    await assessment.save();

    return { isFinished: true };
  }

  remove(id: string) {
    return this.AssessmentModel.findByIdAndRemove(id);
  }

  findCandidateAssessment(userid: string, examid: string, jobId: string) {
    // console.log('jobId', jobId);
    return this.AssessmentModel.findOne({
      candidate: userid,
      exam: examid,
      job: jobId,
    });
  }
}
