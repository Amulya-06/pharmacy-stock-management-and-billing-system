// import Credential from '../models/userModel.js';

// const addCredentials = async (req, res) => {
//   try {
//     const { role, username, password, name, email } = req.body;

//     if (!role || !username || !password || (role === 'Owner' && (!name || !email))) {
//       return res.status(400).json({ message: 'Please fill in all required fields.' });
//     }

//     const newCredential = new Credential({
//       role,
//       username,
//       password,
//       name: role === 'Owner' ? name : undefined,
//       email: role === 'Owner' ? email : undefined,
//     });

//     await newCredential.save();
//     res.status(201).json({ message: 'Credentials added successfully!' });
//   } catch (error) {
//     console.error('Error adding credentials:', error);
//     res.status(500).json({ message: 'Failed to add credentials. Please try again.' });
//   }
// };

// export { addCredentials };
