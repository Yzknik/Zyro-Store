import db from '../config/db.js';

class ProductModel {
    // Categories
    static getAllCategories(): any[] {
        return db.prepare('SELECT * FROM categories').all();
    }
    static createCategory(name: string): number | bigint {
        return db.prepare('INSERT INTO categories (name) VALUES (?)').run(name).lastInsertRowid;
    }
    static deleteCategory(id: number | string): void {
        db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    }

    // Products
    static getAll(): any[] {
        const products = db.prepare(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
        `).all() as any[];

        return products.map(p => {
            const plans = db.prepare('SELECT * FROM plans WHERE product_id = ?').all(p.id);
            return { ...p, plans };
        });
    }

    static getById(id: number | string): any {
        return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    }

    static create(data: any): number | bigint {
        const { name, description, category_id, image_url, status, current_version, download_url, changelog } = data;
        const result = db.prepare(
            'INSERT INTO products (name, description, category_id, image_url, status, current_version, download_url, changelog) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(name, description, category_id, image_url, status || 'UNDETECTED', current_version || '1.0.0', download_url || null, changelog || null);
        return result.lastInsertRowid;
    }

    static update(id: number | string, data: any): void {
        const current: any = this.getById(id);
        if (!current) throw new Error('Produto nao encontrado.');

        const next = {
            name: data.name ?? current.name,
            description: data.description ?? current.description,
            category_id: data.category_id === '' ? null : (data.category_id ?? current.category_id),
            image_url: data.image_url ?? current.image_url,
            status: data.status ?? current.status,
            current_version: data.current_version ?? current.current_version,
            download_url: data.download_url ?? current.download_url,
            changelog: data.changelog ?? current.changelog,
            integrity_hash: data.integrity_hash ?? current.integrity_hash
        };

        db.prepare(`
            UPDATE products
            SET name = ?, description = ?, category_id = ?, image_url = ?, status = ?,
                current_version = ?, download_url = ?, changelog = ?, integrity_hash = ?
            WHERE id = ?
        `).run(
            next.name,
            next.description,
            next.category_id,
            next.image_url,
            next.status || 'UNDETECTED',
            next.current_version || '1.0.0',
            next.download_url || null,
            next.changelog || null,
            next.integrity_hash || null,
            id
        );
    }

    static delete(id: number | string): void {
        db.prepare('DELETE FROM products WHERE id = ?').run(id);
    }

    // Plans
    static getPlans(productId: string | number): any[] {
        return db.prepare('SELECT * FROM plans WHERE product_id = ?').all(productId);
    }

    static createPlan(data: any): number | bigint {
        const { product_id, name, duration_days, price } = data;
        const result = db.prepare(
            'INSERT INTO plans (product_id, name, duration_days, price) VALUES (?, ?, ?, ?)'
        ).run(product_id, name, duration_days, price);
        return result.lastInsertRowid;
    }

    static deletePlan(id: number | string): void {
        db.prepare('DELETE FROM plans WHERE id = ?').run(id);
    }

    // Licenses
    static assignToUser(data: any): number | bigint {
        const { user_id, product_id, plan_id, license_key, expires_at } = data;
        const result = db.prepare(
            'INSERT INTO user_products (user_id, product_id, plan_id, license_key, expires_at) VALUES (?, ?, ?, ?, ?)'
        ).run(user_id, product_id, plan_id, license_key, expires_at ? (expires_at instanceof Date ? expires_at.toISOString() : expires_at) : null);
        return result.lastInsertRowid;
    }

    static getAllLicenses(): any[] {
        return db.prepare(`
            SELECT up.*, u.username, p.name as product_name, pl.name as plan_name
            FROM user_products up 
            JOIN users u ON up.user_id = u.id 
            JOIN products p ON up.product_id = p.id
            LEFT JOIN plans pl ON up.plan_id = pl.id
        `).all();
    }

    static updateLicenseStatus(id: number | string, status: string): void {
        db.prepare('UPDATE user_products SET status = ? WHERE id = ?').run(status, id);
    }

    static deleteLicense(id: number | string): void {
        db.prepare('DELETE FROM user_products WHERE id = ?').run(id);
    }
}

export default ProductModel;
