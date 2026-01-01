CREATE VIEW "public"."low_stock_alert_view" AS (
	SELECT 
		ws.id,
		ws.warehouse_id,
		w.name AS warehouse_name,
		w.code AS warehouse_code,
		ws.sparepart_id,
		s.name AS sparepart_name,
		s.sku AS sparepart_sku,
		ws.current_stock,
		ws.updated_at
	FROM warehouse_stocks ws
	INNER JOIN warehouses w ON ws.warehouse_id = w.id
	INNER JOIN spareparts s ON ws.sparepart_id = s.id
	WHERE ws.current_stock < 10
);--> statement-breakpoint
CREATE VIEW "public"."transaction_details_view" AS (
	SELECT 
		st.id,
		st.type,
		st.quantity,
		st.warehouse_id,
		w.name AS warehouse_name,
		w.code AS warehouse_code,
		st.sparepart_id,
		s.name AS sparepart_name,
		s.sku AS sparepart_sku,
		st.created_at
	FROM stock_transactions st
	INNER JOIN warehouses w ON st.warehouse_id = w.id
	INNER JOIN spareparts s ON st.sparepart_id = s.id
);--> statement-breakpoint
CREATE VIEW "public"."warehouse_stock_details_view" AS (
	SELECT 
		ws.id,
		ws.warehouse_id,
		w.name AS warehouse_name,
		w.code AS warehouse_code,
		ws.sparepart_id,
		s.name AS sparepart_name,
		s.sku AS sparepart_sku,
		ws.current_stock,
		ws.updated_at,
		ws.created_at
	FROM warehouse_stocks ws
	INNER JOIN warehouses w ON ws.warehouse_id = w.id
	INNER JOIN spareparts s ON ws.sparepart_id = s.id
);