import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Motorz',
  description: 'Política de Privacidade da plataforma Motorz.',
};

export default function PrivacidadePage() {
  return (
    <main className="platform-container pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="text-mz-royal font-bold text-sm mb-8 inline-block hover:underline">
          &larr; Voltar para o Início
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-display font-black text-mz-ink mb-6">Política de Privacidade</h1>
        <p className="text-mz-slate mb-12">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="prose prose-lg max-w-none text-mz-slate space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">1. Nosso Compromisso com sua Privacidade</h2>
            <p>
              A Motorz preza pela segurança e privacidade dos seus dados. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos as suas informações pessoais ao utilizar nossa plataforma, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">2. Dados que Coletamos</h2>
            <p>
              Para fornecer nossos serviços e conectar você às melhores ofertas automotivas, podemos coletar:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Dados de Contato (Leads):</strong> Nome completo, número de telefone (WhatsApp) e endereço de e-mail, fornecidos voluntariamente por você ao demonstrar interesse em um veículo.</li>
              <li><strong>Dados de Navegação:</strong> Informações de uso, páginas visitadas, veículos visualizados, endereço IP e tipo de navegador (coletados anonimamente para fins estatísticos e de melhoria contínua da experiência).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">3. Como Usamos seus Dados</h2>
            <p>
              Os dados coletados são utilizados estritamente para os seguintes propósitos:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Intermediação:</strong> Repassar seu interesse e informações de contato diretamente à loja parceira que possui o veículo anunciado, permitindo que a negociação seja iniciada.</li>
              <li><strong>Comunicação:</strong> Enviar atualizações sobre veículos do seu interesse, novidades da Motorz ou responder a dúvidas.</li>
              <li><strong>Segurança:</strong> Proteger a plataforma contra fraudes e atividades maliciosas.</li>
              <li><strong>Melhoria:</strong> Analisar o comportamento de navegação para aprimorar nosso design e funcionalidade.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">4. Compartilhamento de Dados</h2>
            <p>
              <strong>A Motorz não vende seus dados pessoais.</strong> O compartilhamento ocorre apenas nas seguintes situações:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Lojistas Parceiros:</strong> Quando você solicita contato para um veículo, compartilhamos seus dados com a loja detentora do estoque para que possam atendê-lo.</li>
              <li><strong>Fornecedores de Tecnologia:</strong> Empresas que hospedam nossos servidores ou serviços de banco de dados, os quais operam sob rigorosos contratos de confidencialidade.</li>
              <li><strong>Obrigação Legal:</strong> Quando exigido por autoridades judiciais ou governamentais, nos termos da lei.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">5. Segurança e Armazenamento</h2>
            <p>
              Adotamos medidas técnicas e administrativas modernas (como criptografia e controle de acessos restrito) para proteger seus dados pessoais contra acessos não autorizados, perdas ou alterações. Seus dados são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta política ou conforme exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">6. Seus Direitos (LGPD)</h2>
            <p>
              Você, como titular dos dados, tem o direito de:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Confirmar a existência de tratamento e solicitar o acesso aos seus dados.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
              <li>Revogar seu consentimento a qualquer momento.</li>
            </ul>
            <p className="mt-4">
              Para exercer seus direitos, entre em contato conosco através dos nossos canais de atendimento oficiais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">7. Alterações na Política de Privacidade</h2>
            <p>
              Reservamo-nos o direito de atualizar esta Política de Privacidade periodicamente. Recomendamos que você revise esta página regularmente. O uso contínuo da plataforma após alterações significa sua aceitação da nova Política.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
