import { AuditPanel } from '@/modules/audit/components/AuditPanel';
import { PageHeader } from '@/shared/components/PageHeader';
import { AppLayout } from '@/shared/layouts/AppLayout';

export function AdminAudit() {
	return (
		<AppLayout>
			<div className="flex flex-col gap-8">
				<PageHeader
					title="Registro de uso"
					description="Tudo que foi criado, alterado ou removido no sistema, e por quem."
				/>

				<AuditPanel />
			</div>
		</AppLayout>
	);
}
