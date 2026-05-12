-- Remove the duplicate 'user' role from the demo admin who should only have 'admin'
DELETE FROM public.user_roles 
WHERE user_id = '79b6b556-6a6b-4a61-8e0c-9a44258524fc' 
AND role = 'user';