import PageHeader from "@/components/PageHeader";
import { getPageContent, getSection, getPageSEO } from "@/lib/content";
import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent('contact');
  const seo = getPageSEO(content, 'contact');
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  };
}

export default async function ContactPage() {
  const content = await getPageContent('contact');
  const hero = getSection<{ title: string; description: string }>(content, 'hero');
  const form = getSection<{
    interests: Array<{ value: string; label: string }>;
  }>(content, 'form');
  const info = getSection<{
    title: string;
    email: string;
    location: string;
  }>(content, 'info');
  const contactInfo = getSection<{
    email: string;
    phone: string;
    alternatePhone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  }>(content, 'contactInfo');
  const expectations = getSection<{
    title: string;
    items: string[];
  }>(content, 'expectations');
  const successMessage = getSection<{
    title: string;
    description: string;
  }>(content, 'successMessage');

  return (
    <>
      <PageHeader
        title={hero?.title || "Get in Touch"}
        description={hero?.description || "Ready to transform your revenue operations? Let's start the conversation."}
        breadcrumb={[{ label: "Contact", href: "/contact" }]}
      />
      <ContactClient
        form={form}
        info={info}
        contactInfo={contactInfo}
        expectations={expectations}
        successMessage={successMessage}
      />
    </>
  );
}