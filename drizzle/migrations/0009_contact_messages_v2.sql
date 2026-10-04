ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS enquiry_type text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
UPDATE public.contact_messages SET enquiry_type = interest WHERE enquiry_type IS NULL;
COMMENT ON COLUMN public.contact_messages.interest IS 'DEPRECATED: replaced by enquiry_type';
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_status_check CHECK (status IN ('new','read','replied','archived')),
  ADD CONSTRAINT contact_messages_len_check CHECK (
    char_length(name) BETWEEN 1 AND 120 AND char_length(email) BETWEEN 3 AND 255
    AND char_length(message) BETWEEN 10 AND 5000
    AND (phone IS NULL OR char_length(phone) <= 40)
    AND (organisation IS NULL OR char_length(organisation) <= 160)
    AND (enquiry_type IS NULL OR char_length(enquiry_type) <= 120));
DROP TRIGGER IF EXISTS trg_contact_messages_updated ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_updated BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
GRANT DELETE ON public.contact_messages TO authenticated;
CREATE POLICY contact_messages_admin_delete ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));