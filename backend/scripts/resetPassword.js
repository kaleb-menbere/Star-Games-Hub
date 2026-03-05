const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const email = 'stech0240@gmail.com'; // Change to the email you want
    const newPassword = 'admin123'; // Change to desired password
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }
    
    user.password = hashedPassword;
    await user.save();
    
    console.log(`✅ Password reset for ${email}`);
    console.log(`New password: ${newPassword}`);
    
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

resetPassword();