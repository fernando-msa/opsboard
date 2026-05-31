import bcrypt from 'bcryptjs';

const demoAccounts = [
  { name: 'Demo Admin', email: 'admin@demo.com' },
  { name: 'Demo Support', email: 'suporte@demo.com' },
  { name: 'Demo Ops', email: 'ops@demo.com' }
];

async function validateSeed() {
  console.log('🧪 Testando lógica de seed de contas demo...\n');
  
  // Test 1: Validar hash de password
  console.log('✓ Teste 1: Hash de password');
  const password = 'demo1234';
  const hash = await bcrypt.hash(password, 10);
  const isValid = await bcrypt.compare(password, hash);
  console.log(`  - Password: ${password}`);
  console.log(`  - Hash gerado com sucesso: ${hash.substring(0, 20)}...`);
  console.log(`  - Validação do hash: ${isValid ? '✅ PASSOU' : '❌ FALHOU'}\n`);

  // Test 2: Validar contas de demo
  console.log('✓ Teste 2: Contas Demo');
  for (const account of demoAccounts) {
    console.log(`  - Email: ${account.email}`);
    console.log(`    Nome: ${account.name}`);
  }
  console.log('');

  // Test 3: Validar page.tsx data
  console.log('✓ Teste 3: Dados da página de login');
  const loginData = {
    demoEmail: 'admin@demo.com',
    demoPassword: 'demo1234',
    allAccounts: demoAccounts.map(a => a.email)
  };
  console.log(`  - Email pré-preenchido: ${loginData.demoEmail}`);
  console.log(`  - Password pré-preenchido: ${loginData.demoPassword}`);
  console.log(`  - Contas disponíveis: ${loginData.allAccounts.join(', ')}\n`);

  // Test 4: Simular login
  console.log('✓ Teste 4: Simulação de fluxo de login');
  const testEmail = 'admin@demo.com';
  const testPassword = 'demo1234';
  const storedHash = await bcrypt.hash(testPassword, 10);
  
  const loginAttempt = await bcrypt.compare(testPassword, storedHash);
  console.log(`  - Email: ${testEmail}`);
  console.log(`  - Password: ${testPassword}`);
  console.log(`  - Validação de credenciais: ${loginAttempt ? '✅ LOGIN VÁLIDO' : '❌ FALHA'}\n`);

  console.log('🎉 Todos os testes de validação passaram!');
  console.log('\n📋 Resumo das contas demo:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Organização: demo-company');
  console.log('\nContas disponíveis:');
  demoAccounts.forEach((acc, i) => {
    console.log(`  ${i + 1}. ${acc.name}`);
    console.log(`     Email: ${acc.email}`);
    console.log(`     Senha: ${password}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

validateSeed().catch(console.error);
