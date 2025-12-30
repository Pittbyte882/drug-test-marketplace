-- Seed common drug test types
INSERT INTO test_types (name, description, category) VALUES
  ('Urine Drug Testing', 'Standard urine-based drug screening', 'drug_test'),
  ('5 Panel Drug Test', 'Tests for 5 common drugs', 'drug_test'),
  ('10 Panel Drug Test', 'Comprehensive 10-drug panel screening', 'drug_test'),
  ('12 Panel Drug Test', 'Extended 12-drug panel screening', 'drug_test'),
  ('DOT Drug Testing', 'Department of Transportation required testing', 'drug_test'),
  ('Hair Drug Tests', 'Hair follicle drug testing', 'drug_test'),
  ('Alcohol Tests', 'Alcohol screening tests', 'drug_test'),
  ('Urine Alcohol Tests', 'Urine-based alcohol detection', 'drug_test'),
  ('Breath Alcohol Tests', 'Breathalyzer alcohol testing', 'drug_test'),
  ('Employment Drug Testing', 'Pre-employment drug screening', 'drug_test'),
  ('Court-Ordered Drug Testing', 'Court-mandated drug testing', 'drug_test'),
  ('Drug Test Panels', 'Various panel configurations', 'drug_test'),
  ('Drugs Tested', 'Individual drug testing', 'drug_test')
ON CONFLICT DO NOTHING;

-- Seed DNA test types
INSERT INTO test_types (name, description, category) VALUES
  ('Alternative DNA Test', 'Alternative paternity testing methods', 'dna_test'),
  ('Paternity Testing', 'Standard paternity DNA test', 'dna_test'),
  ('Legal Paternity Test', 'Court-admissible paternity testing', 'dna_test'),
  ('Home DNA Test Kit', 'At-home DNA testing kit', 'dna_test'),
  ('Prenatal Paternity Test', 'Paternity testing before birth', 'dna_test'),
  ('Sibling DNA Test', 'DNA test for siblings', 'dna_test'),
  ('Aunt or Uncle DNA Test', 'Avuncular DNA testing', 'dna_test'),
  ('Grandparent DNA Test', 'Grandparentage DNA testing', 'dna_test'),
  ('Postmortem DNA Test', 'DNA testing after death', 'dna_test'),
  ('Hair DNA Test', 'Hair-based DNA testing', 'dna_test')
ON CONFLICT DO NOTHING;

-- Seed background check types
INSERT INTO test_types (name, description, category) VALUES
  ('Triple Database Package', 'Comprehensive 3-database search', 'background_check'),
  ('Court Record Package', 'Court record background check', 'background_check'),
  ('Platinum Package', 'Premium background screening', 'background_check'),
  ('Ultimate Package', 'Most comprehensive background check', 'background_check'),
  ('Resume Verification', 'Employment history verification', 'background_check'),
  ('DOT Background Check', 'DOT-compliant background screening', 'background_check')
ON CONFLICT DO NOTHING;

-- Seed occupational health test types
INSERT INTO test_types (name, description, category) VALUES
  ('Occupational Health Locations', 'General occupational health services', 'occupational_health'),
  ('Antibody Testing', 'COVID-19 and other antibody tests', 'occupational_health'),
  ('Biometrics', 'Biometric health screening', 'occupational_health'),
  ('Employment Physical', 'Pre-employment physical examination', 'occupational_health'),
  ('Respiratory Health Exam', 'Respiratory system evaluation', 'occupational_health'),
  ('Tuberculosis (TB) Testing', 'TB screening tests', 'occupational_health'),
  ('Vaccines', 'Occupational vaccination services', 'occupational_health'),
  ('Vision and Hearing', 'Vision and hearing tests', 'occupational_health')
ON CONFLICT DO NOTHING;
