const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

async function forceResetPassword() {
  try {
    const email = 'stech0240@gmail.com';
    const newPassword = 'admin123';
    
    console.log('1. Looking for user:', email);
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('2. User found:', user.email, user.role);
    
    // Generate new hash
    console.log('3. Generating new password hash...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('   New hash:', hashedPassword);
    
    // Update directly using update method
    console.log('4. Updating password...');
    await User.update(
      { password: hashedPassword },
      { where: { email } }
    );
    
    // Verify the update
    console.log('5. Verifying update...');
    const updatedUser = await User.findOne({ 
      where: { email },
      attributes: ['password']
    });
    
    // Test the new password
    const testMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('6. Password test:', testMatch ? '✅ SUCCESS' : '❌ FAILED');
    
    if (testMatch) {
      console.log('\n✅ Password reset successful!');
      console.log('Email:', email);
      console.log('Password:', newPassword);
    } else {
      console.log('\n❌ Password reset failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

forceResetPassword();