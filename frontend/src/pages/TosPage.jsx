import { useContext } from 'react'
import { LangContext } from '../App'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TosPage = () => {
    const { t } = useContext(LangContext)

    const sections = [
        {
            title: "1. Aceitação dos Termos",
            content: "Ao acessar e usar a Zyro Store, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não poderá usar nossos serviços."
        },
        {
            title: "2. Licença de Uso",
            content: "Concedemos a você uma licença limitada, não exclusiva e intransferível para usar nosso software de acordo com o plano adquirido. Qualquer tentativa de engenharia reversa, redistribuição ou modificação do software resultará no cancelamento imediato da licença sem reembolso."
        },
        {
            title: "3. Política de Reembolso",
            content: "Devido à natureza digital de nossos produtos, todos os pagamentos são finais. Reembolsos podem ser emitidos apenas em casos excepcionais onde o software não funcione conforme descrito e após nossa equipe de suporte tentar resolver o problema."
        },
        {
            title: "4. Isenção de Responsabilidade",
            content: "O uso de softwares de terceiros em jogos online envolve riscos. A Zyro Store não é responsável por banimentos, suspensões ou qualquer perda de dados decorrente do uso de nossas ferramentas. Você assume total responsabilidade por suas ações."
        },
        {
            title: "5. Atualizações e Manutenção",
            content: "Reservamo-nos o direito de atualizar o software e os termos de serviço a qualquer momento para garantir a segurança e estabilidade. O tempo de inatividade para manutenção é possível e será comunicado via Discord."
        }
    ]

    const sectionsEn = [
        {
            title: "1. Acceptance of Terms",
            content: "By accessing and using Zyro Store, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services."
        },
        {
            title: "2. License to Use",
            content: "We grant you a limited, non-exclusive, non-transferable license to use our software in accordance with the purchased plan. Any attempt to reverse engineer, redistribute, or modify the software will result in immediate license cancellation without refund."
        },
        {
            title: "3. Refund Policy",
            content: "Due to the digital nature of our products, all payments are final. Refunds may only be issued in exceptional cases where the software does not work as described and after our support team has attempted to resolve the issue."
        },
        {
            title: "4. Disclaimer",
            content: "The use of third-party software in online games involves risks. Zyro Store is not responsible for bans, suspensions, or any loss of data resulting from the use of our tools. You assume full responsibility for your actions."
        },
        {
            title: "5. Updates and Maintenance",
            content: "We reserve the right to update the software and terms of service at any time to ensure security and stability. Maintenance downtime is possible and will be communicated via Discord."
        }
    ]

    const activeSections = t.nav.tos === 'ToS' ? sectionsEn : sections

    return (
        <div style={{ minHeight: '100vh', background: '#080c14', color: '#e2e8f0' }}>
            <Navbar />

            <div style={{ paddingTop: '140px', paddingBottom: '100px', position: 'relative' }}>
                <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.2 }} />

                <div className="container-lg" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="reveal active" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '950', marginBottom: '1rem', color: '#fff' }}>
                            Terms of <span className="glow-text">Service</span>
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'rgba(148, 163, 184, 0.7)', marginBottom: '4rem' }}>
                            {t.nav.tos === 'ToS' ? 'Last updated: March 2024' : 'Última atualização: Março de 2024'}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {activeSections.map((section, i) => (
                                <div key={i} className="glass" style={{ padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6', marginBottom: '1.5rem' }}>{section.title}</h2>
                                    <p style={{ fontSize: '1.1rem', color: 'rgba(148, 163, 184, 0.8)', lineHeight: '1.8' }}>{section.content}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '5rem', textAlign: 'center', padding: '3rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '24px', border: '1px dashed rgba(59, 130, 246, 0.3)' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>
                                {t.nav.tos === 'ToS' ? 'Have questions?' : 'Tem dúvidas?'}
                            </h3>
                            <p style={{ color: 'rgba(148, 163, 184, 0.7)', marginBottom: '2rem' }}>
                                {t.nav.tos === 'ToS' ? 'If you have any questions about our terms, please contact us on Discord.' : 'Se tiver qualquer dúvida sobre nossos termos, entre em contato via Discord.'}
                            </p>
                            <a href="https://discord.gg" className="btn-primary" style={{ padding: '12px 35px' }}>
                                Zyro Discord
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default TosPage
