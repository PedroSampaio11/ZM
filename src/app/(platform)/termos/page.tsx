import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos e Condições | Motorz',
  description: 'Termos e Condições de Uso da plataforma Motorz.',
};

export default function TermosPage() {
  return (
    <main className="platform-container pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="text-mz-royal font-bold text-sm mb-8 inline-block hover:underline">
          &larr; Voltar para o Início
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-display font-black text-mz-ink mb-6">Termos e Condições de Uso</h1>
        <p className="text-mz-slate mb-12">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="prose prose-lg max-w-none text-mz-slate space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">1. Introdução</h2>
            <p>
              Bem-vindo à Motorz. Estes Termos e Condições de Uso regulam o acesso e uso da plataforma Motorz, um marketplace automotivo premium que conecta compradores a lojistas parceiros rigorosamente selecionados ("Lojistas"). Ao acessar ou utilizar nossa plataforma, você concorda em cumprir e ficar vinculado a estes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">2. Natureza dos Serviços</h2>
            <p>
              A Motorz atua exclusivamente como uma plataforma de classificados online e aproximação entre partes (lead generation). <strong>Nós não somos proprietários dos veículos anunciados</strong>, não realizamos a venda direta, não recebemos pagamentos referentes às transações dos veículos e não participamos da entrega ou transferência de titularidade. Toda transação é realizada diretamente entre o usuário comprador e a loja parceira vendedora.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">3. Informações dos Veículos e "Inspeção Motorz"</h2>
            <p>
              As informações técnicas, preços, disponibilidade e imagens dos veículos são fornecidas diretamente pelos lojistas parceiros. Embora a Motorz realize verificações de qualidade e estabeleça um padrão premium ("Inspeção Motorz"), não garantimos a exatidão absoluta de todas as informações. A Inspeção Motorz é um selo de verificação de padrão das lojas da nossa rede, mas não substitui a vistoria cautelar e a avaliação mecânica que devem ser realizadas ou exigidas pelo comprador no momento da compra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">4. Captura de Leads e Comunicação</h2>
            <p>
              Ao demonstrar interesse em um veículo e preencher nossos formulários de contato ("Tenho Interesse", "Contato"), você autoriza a Motorz a compartilhar seus dados de contato (Nome, E-mail, Telefone/WhatsApp) exclusivamente com a loja proprietária do veículo de interesse, para que a mesma possa dar andamento à negociação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">5. Responsabilidades do Usuário</h2>
            <p>
              O usuário compromete-se a:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Fornecer informações verdadeiras e precisas ao preencher os formulários.</li>
              <li>Não utilizar a plataforma para fins ilícitos, fraudulentos ou que violem direitos de terceiros.</li>
              <li>Agir com cautela nas negociações, certificando-se da idoneidade da transação antes de efetuar qualquer pagamento diretamente ao lojista.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">6. Limitação de Responsabilidade</h2>
            <p>
              A Motorz não se responsabiliza por:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Vícios ocultos ou defeitos mecânicos nos veículos anunciados.</li>
              <li>Discrepâncias entre o anúncio e o estado real do veículo.</li>
              <li>Danos diretos, indiretos, incidentais ou consequentes resultantes de negociações frustradas ou concluídas com os lojistas parceiros.</li>
              <li>Indisponibilidade temporária da plataforma por motivos técnicos ou de força maior.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">7. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma (logotipos, textos, design, interfaces) é de propriedade exclusiva da Motorz. O uso não autorizado destes materiais é estritamente proibido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-mz-ink mb-4">8. Foro e Legislação Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer controvérsias, fica eleito o foro da comarca da sede da Motorz, com renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
