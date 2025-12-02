-- Migration to import existing hardcoded contracts and templates
-- This populates the templates_forms table with existing data

-- Insert existing contracts from ContractsLibraryPage
INSERT INTO public.templates_forms (name, description, category, subcategory, file_url, file_name, file_type, is_featured, is_active) VALUES
-- Education Category
('100 Point List - Best Practices', 'Comprehensive checklist for real estate investment best practices', 'contract', 'Education', '/contracts/100_POINT_LIST_-_BEST_PRACTICES.pdf', '100_POINT_LIST_-_BEST_PRACTICES.pdf', 'pdf', false, true),
('Benefits of Owner Financing', 'Guide to owner financing benefits and strategies', 'contract', 'Education', '/contracts/BENEFITS OF OWNER FINANCING.docx', 'BENEFITS OF OWNER FINANCING.docx', 'docx', false, true),
('Credit Repair eBook', 'Comprehensive guide to credit repair strategies', 'contract', 'Education', '/contracts/Credit-Repair-ebook.pdf', 'Credit-Repair-ebook.pdf', 'pdf', false, true),
('Exit Strategies as Investors', 'Guide to various exit strategies for real estate investors', 'contract', 'Education', '/contracts/Exit+Strategies+as+Investors.pdf', 'Exit+Strategies+as+Investors.pdf', 'pdf', false, true),

-- Legal Category
('Affidavit of Equitable Interest', 'Legal document establishing equitable interest in property', 'contract', 'Legal', '/contracts/Affidavit-of-Equitable-Interest.pdf', 'Affidavit-of-Equitable-Interest.pdf', 'pdf', false, true),
('Confidentiality Agreement', 'Non-disclosure agreement for protecting confidential information', 'contract', 'Legal', '/contracts/Confidentiality-agreement-template.pdf', 'Confidentiality-agreement-template.pdf', 'pdf', true, true),
('Confidentiality Non-Circumvent Agreement', 'Protects parties from being bypassed in transactions', 'contract', 'Legal', '/contracts/Confidentiality - Non-Circumvent Agreement.doc', 'Confidentiality - Non-Circumvent Agreement.doc', 'doc', false, true),
('Deed of Trust Equity', 'Deed of trust document for equity transactions', 'contract', 'Legal', '/contracts/Deed-of-Trust-Equity-PDF-1.pdf', 'Deed-of-Trust-Equity-PDF-1.pdf', 'pdf', false, true),

-- Wholesale Category
('Assignment Agreement Contract', 'Standard assignment agreement for wholesale transactions', 'contract', 'Wholesale', '/contracts/Assignment_Agreement_Template.pdf', 'Assignment_Agreement_Template.pdf', 'pdf', true, true),
('Assignment of Purchase and Sale Agreement', 'Complete assignment of purchase and sale agreement template', 'contract', 'Wholesale', '/contracts/Assignment+of+Purchase+and+Sale+Ageement.docx', 'Assignment+of+Purchase+and+Sale+Ageement.docx', 'docx', true, true),
('Buyer Assignment Agreement', 'Agreement for assigning contracts to end buyers', 'contract', 'Wholesale', '/contracts/Buyer Assignment Agreement.pdf', 'Buyer Assignment Agreement.pdf', 'pdf', false, true),

-- Options Category
('Blank Option Agreement', 'Blank option agreement template for lease options', 'contract', 'Options', '/contracts/Blank-Option-Agreement.pdf', 'Blank-Option-Agreement.pdf', 'pdf', false, true),

-- Financing Category
('Cover Letter for Private Lender Credibility', 'Professional cover letter template for private lender packages', 'contract', 'Financing', '/contracts/Cover+Letter+for+Private+Lender+Credibility+Package.pdf', 'Cover+Letter+for+Private+Lender+Credibility+Package.pdf', 'pdf', false, true),
('JV Agreement', 'Joint venture agreement template for partnerships', 'contract', 'Financing', '/contracts/JV-Agreement-PDF-1.pdf', 'JV-Agreement-PDF-1.pdf', 'pdf', false, true),
('Limited Partnership Agreement', 'Template for limited partnership agreements', 'contract', 'Financing', '/contracts/Limited-Partnership-Agreement-Template-WA-Fillable.pdf', 'Limited-Partnership-Agreement-Template-WA-Fillable.pdf', 'pdf', false, true),

-- Marketing Category
('Executive Summary Template - Wholesale', 'Professional executive summary for wholesale deals', 'contract', 'Marketing', '/contracts/Executive Summary template - Wholesale.pdf', 'Executive Summary template - Wholesale.pdf', 'pdf', false, true),
('Letter of Intent Template', 'Standard letter of intent template', 'contract', 'Marketing', '/contracts/LOI_2template.pdf', 'LOI_2template.pdf', 'pdf', false, true),
('LOI Multi-Family Template', 'Specialized LOI template for multi-family properties', 'contract', 'Marketing', '/contracts/LOI-Multi-Family-Template-my0cim.pdf', 'LOI-Multi-Family-Template-my0cim.pdf', 'pdf', false, true),
('Purchase and Sale Agreement Template', 'Standard purchase and sale agreement template', 'contract', 'Marketing', '/contracts/Purchase-and-Sale-Agreement-Template-v1.0-uam30m.pdf', 'Purchase-and-Sale-Agreement-Template-v1.0-uam30m.pdf', 'pdf', true, true)

ON CONFLICT (id) DO NOTHING;

-- Insert existing Canva templates
INSERT INTO public.templates_forms (name, description, category, subcategory, file_url, file_name, file_type, canva_template_id, is_featured, is_active) VALUES
('Property Offer Postcard', 'Professional postcard design for property offers', 'canva-template', 'Postcard', '', 'Property Offer Postcard', 'canva', 'DAF8nN9QX8o', true, true),
('We Buy Houses Postcard', 'Eye-catching postcard for motivated sellers', 'canva-template', 'Postcard', '', 'We Buy Houses Postcard', 'canva', 'DAF8nN9QX8o', false, true),
('Investment Property Flyer', 'Detailed property investment flyer', 'canva-template', 'Flyer', '', 'Investment Property Flyer', 'canva', 'DAF8nN9QX8o', false, true),
('Foreclosure Help Flyer', 'Informative flyer for homeowners facing foreclosure', 'canva-template', 'Flyer', '', 'Foreclosure Help Flyer', 'canva', 'DAF8nN9QX8o', false, true),
('Real Estate Investor Card', 'Professional business card design', 'canva-template', 'Business Card', '', 'Real Estate Investor Card', 'canva', 'DAF8nN9QX8o', false, true),
('Instagram Property Post', 'Social media post template for properties', 'canva-template', 'Social Media', '', 'Instagram Property Post', 'canva', 'DAF8nN9QX8o', false, true),
('Facebook Success Story', 'Share your success stories on Facebook', 'canva-template', 'Social Media', '', 'Facebook Success Story', 'canva', 'DAF8nN9QX8o', false, true),
('Deal Analysis Presentation', 'Professional presentation for deal analysis', 'canva-template', 'Presentation', '', 'Deal Analysis Presentation', 'canva', 'DAF8nN9QX8o', true, true)

ON CONFLICT (id) DO NOTHING;

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Successfully imported % contracts and templates', (SELECT COUNT(*) FROM public.templates_forms);
END $$;
