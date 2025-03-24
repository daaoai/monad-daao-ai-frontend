import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shadcn/components/ui/accordion';
import * as React from 'react';

const faqs = [
  {
    question: 'What is DAAO.ai?',
    answer:
      'DAAO.ai is a decentralized autonomous organization (DAO) platform enabling communities to govern AI agents that drive investments and grant allocations across AI, DeFi, Infrastructure, and Sciences.',
  },
  {
    question: 'Why DAAO.ai?',
    answer:
      'DAAO.ai allows users to launch and manage AI-driven agents for investment and grant disbursement, raising capital directly from the community.',
  },
  {
    question: 'What chains are available?',
    answer:
      'Our MVP prototype is on Mode and we plan to expand to Monad, Hyperliquid and more over time based on user demand.',
  },
  {
    question: 'How does fundraising work on DAAO.ai?',
    answer:
      'Creators have one month to fundraise the desired amount of capital in MODE. This fundraising process is a fair launch for the DAO token, where every participant gets the same price.',
  },
  {
    question: 'What happens when the fund expires?',
    answer:
      'When the fund expires, the DAO wallet is frozen, and any profits in MODE are distributed back to the token holders.',
  },
  {
    question: 'How do AI agents work on DAAO.ai?',
    answer:
      'AI agents launched on DAAO.ai are programmed to handle investments and grants. These agents can access funding directly from the community and are governed by the contributors.',
  },
  {
    question: 'What types of projects can AI agents fund on DAAO.ai?',
    answer: 'AI agents on DAAO.ai are focused on projects related to AI, DeFi, Infra, and more.',
  },
  {
    question: 'Who can participate in decision-making on DAAO.ai?',
    answer:
      'The platform allows the contributors to have a say in how AI agents are governed and how funds are allocated.',
  },
  {
    question: 'How do I become a contributor on DAAO.ai?',
    answer:
      'Trade or invest on the platform to become a contributor. This grants access to discussions, governance votes, and decision-making on AI agents, investments, and funding.',
  },
];

const FAQDaao = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent className="text-left">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
export default FAQDaao;
