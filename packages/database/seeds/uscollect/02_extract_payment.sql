SET sql_mode='';
SELECT id, caseid, amount, IFNULL(NULLIF(`date`,'0000-00-00'),'NULL'), IFNULL(NULLIF(method,''),'NULL'), status FROM rdebt_payment;
