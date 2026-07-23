SET sql_mode='';
SELECT
 c.id,
 c.client_id,
 CONCAT('Client ',c.client_id),
 'NULL','NULL','NULL',
 COALESCE(s.status_name,'Unknown'),
 CASE s.status_type WHEN 1 THEN 'Active' WHEN 4 THEN 'Closed/Recalled' WHEN 2 THEN 'Type2' WHEN 3 THEN 'Type3' ELSE 'Unknown' END,
 'NULL','NULL',
 IFNULL(NULLIF(c.`date`,'0000-00-00'),'NULL'),
 IFNULL(NULLIF(c.last_activity_date,'0000-00-00 00:00:00'),'NULL'),
 'NULL','NULL',
 c.d_clientbalance,
 c.amount1,
 IF(c.holdcount>0,'t','f'),
 IF(a.case_id IS NOT NULL,'t','f'),
 IF(a.case_id IS NOT NULL,'t','f'),
 'f'
FROM rdebt_cases c
LEFT JOIN rdebt_case_status s ON s.id=c.current_status_id
LEFT JOIN (SELECT DISTINCT case_id FROM rdebt_arrangements WHERE active=1) a ON a.case_id=c.id;
