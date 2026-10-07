import { AuditPanel } from '@/modules/audit/components/AuditPanel';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageWidth } from '@/shared/components/PageWidth';

export function AdminAudit() {
	return (
		<PageWidth>
			<div className="flex flex-col gap-8">
				<PageHeader
					title="Registro de uso"
					description="Tudo que foi criado, alterado ou removido no sistema, e por quem."
				/>

				<AuditPanel />
			</div>
		</PageWidth>
	);
}
