import {User} from '@/lib/models/user.model';
import {ConnectToDB} from '@/lib/db';
import {NextResponse } from "next/server";


const students = [
  { name: "Aaditya Singh", studentNo: "2413059", email: "aaditya2413059@akgec.ac.in" },
  { name: "Aadhya Gupta", studentNo: "2413036", email: "aadhya2413036@akgec.ac.in" },
  { name: "Aakarsan Dube", studentNo: "24154135", email: "aakarsan24154135@akgec.ac.in" },
  { name: "Aashika Sahu", studentNo: "2421071", email: "aashika2421071@akgec.ac.in" },
  { name: "Abhay Pratap Singh", studentNo: "2410146", email: "abhay2410146@akgec.ac.in" },
  { name: "Agrim Dubey", studentNo: "24154080", email: "agrim24154080@akgec.ac.in" },
  { name: "Amit Kumar Rai", studentNo: "24164023", email: "amit24164023@akgec.ac.in" },
  { name: "Anjali Agarwal", studentNo: "2410107", email: "anjali2410107@akgec.ac.in" },
  { name: "Ankush Verma", studentNo: "2411080", email: "ankush2411080@akgec.ac.in" },
  { name: "Anushka Yadav", studentNo: "2410154", email: "anushka2410154@akgec.ac.in" },
  { name: "Aviral", studentNo: "24154091", email: "aviral24154091@akgec.ac.in" },
  { name: "Darshil Singh", studentNo: "2412126", email: "darshil2412126@akgec.ac.in" },
  { name: "Dishant Singh", studentNo: "24154003", email: "dishant24154003@akgec.ac.in" },
  { name: "Harsh Giri", studentNo: "24154015", email: "harsh24154015@akgec.ac.in" },
  { name: "Harshita Sharma", studentNo: "24153006", email: "harshita24153006@akgec.ac.in" },
  { name: "Iraa Garg", studentNo: "24154007", email: "iraa24154007@akgec.ac.in" },
  { name: "Ketan Narula", studentNo: "2431027", email: "ketan2431027@akgec.ac.in" },
  { name: "Krish Sharma", studentNo: "2413179", email: "krish2413179@akgec.ac.in" },
  { name: "Mayank Gupta", studentNo: "2412136", email: "mayank2412136@akgec.ac.in" },
  { name: "Naina Batra", studentNo: "24154117", email: "naina24154117@akgec.ac.in" },
  { name: "Nidhi Singh Chauhan", studentNo: "2413079", email: "nidhi2413079@akgec.ac.in" },
  { name: "Nikhil Gupta", studentNo: "2412052", email: "nikhil2412052@akgec.ac.in" },
  { name: "Nilenjay Singh Sengar", studentNo: "2410175", email: "nilenjay2410175@akgec.ac.in" },
  { name: "Pulkit Sabarwal", studentNo: "2412185", email: "pulkit2412185@akgec.ac.in" },
  { name: "Raunak Juneja", studentNo: "24169032", email: "raunak24169032@akgec.ac.in" },
  { name: "Sahyadri Mangalam", studentNo: "2413082", email: "sahyadri2413082@akgec.ac.in" },
  { name: "Sanchit Bharadwaj", studentNo: "2410057", email: "sanchit2410057@akgec.ac.in" },
  { name: "Sanyam Agarwal", studentNo: "2410147", email: "sanyam2410147@akgec.ac.in" },
  { name: "Saurabh Kumar", studentNo: "2413001", email: "saurabh2413001@akgec.ac.in" },
  { name: "Shafqa Fatima", studentNo: "2413120", email: "shafqa2413120@akgec.ac.in" },
  { name: "Shankaran Prakash", studentNo: "2431032", email: "shankaran2431032@akgec.ac.in" },
  { name: "Shreya Sahu", studentNo: "24164012", email: "shreya24164012@akgec.ac.in" },
  { name: "Siddharth Singh", studentNo: "24153082", email: "siddharth24153082@akgec.ac.in" },
  { name: "Sneha Tiwari", studentNo: "2431195", email: "sneha2431195@akgec.ac.in" },
  { name: "Snehil Teotia", studentNo: "24169023", email: "snehil24169023@akgec.ac.in" },
  { name: "Somya Agarwal", studentNo: "24164026", email: "somya24164026@akgec.ac.in" },
  { name: "Suryansh Gautam", studentNo: "24154139", email: "suryansh24154139@akgec.ac.in" },
  { name: "Tanishka Saxena", studentNo: "2412110", email: "tanishka2412110@akgec.ac.in" },
  { name: "Taran Singh", studentNo: "2411044", email: "taran2411044@akgec.ac.in" },
  { name: "Vansh Monga", studentNo: "24164035", email: "vansh24164035@akgec.ac.in" },
  { name: "Vanshika Agarwal", studentNo: "2412076", email: "vanshika2412076@akgec.ac.in" },
  { name: "Vedanshi Prajapati", studentNo: "2413146", email: "vedanshi2413146@akgec.ac.in" },
  { name: "Vidhi Gupta", studentNo: "24153139", email: "vidhi24153139@akgec.ac.in" },
  { name: "Vishakha Ahlawat", studentNo: "2411072", email: "vishakha2411072@akgec.ac.in" },
  { name: "Yashasvi Khatri", studentNo: "2412064", email: "yashasvi2412064@akgec.ac.in" },
  { name: "Yashika Sahu", studentNo: "2431046", email: "yashika2431046@akgec.ac.in" }
]


export async function POST(req:Request) {
    try {
      await ConnectToDB();
    const body = await req.json();
    const {studentNo, password ,name} = body;

    console.log(studentNo, password);
    console.log(body);
    console.log("here")




    if (!studentNo || !password || !name) {
      return NextResponse.json({ message: 'studentNo and password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ studentNo });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const findExistingUser = students.filter((student) => student.studentNo == studentNo)

    console.log(findExistingUser)

    // if (findExistingUser.length === 0) {
    //   return NextResponse.json({ error: 'Invalid Authorization' }, { status: 400 });
    // }

    const user = new User({ studentNo, password , Name : name});
    await user.save();

    return NextResponse.json({ message: 'User created successfully!' });
    } catch (error) {
      return NextResponse.json ({
        error : "Failed to Register",
        data:error
      })
    }
  }
