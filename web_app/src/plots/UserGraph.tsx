import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import type { RecordModel } from 'pocketbase';


function getFillPercentage(company: RecordModel) {
    const values = Object.values(company);
    const filledValues = values.filter((value) => value !== '' && value !== null && value !== undefined).length;
    return values.length === 0 ? 0 : Math.floor((filledValues / values.length) * 100);
}

export default function UserGraph({
    colorMode,
    companies,
    selectedUser,
}: {
    colorMode: 'light' | 'dark';
    companies: RecordModel[];
    selectedUser: RecordModel | undefined;
}) {
    const companyNodes: Node[] = companies.map((company, index) => {
        const verticalPosition = (index - (companies.length - 1) / 2) * 360;
        const created = company.created ? new Date(company.created).toLocaleDateString() : 'Unknown';

        return {
            id: company.id,
            position: { x: verticalPosition, y: 200 },
            data: {
                label: (
                    <div style={{ display: 'grid', gap: 4, minWidth: 220 }}>
                        <strong>{company.name || 'Unnamed company'}</strong>
                        <span>ID: {company.id}</span>
                        <span>Fill: {getFillPercentage(company)}%</span>
                        <span>Created: {created}</span>
                    </div>
                ),
            },
            style: { width: 270 },
        };
    });
    const userName = selectedUser
        ? [selectedUser.name, selectedUser.surname].filter(Boolean).join(' ') || selectedUser.email || selectedUser.id
        : '';
    const nodes: Node[] = selectedUser ? [
        {
            id: 'selected-user',
            type: 'input',
            position: { x: 0, y: 0 },
            data: { label: <strong>{userName}</strong> },
            style: { width: 240 },
        },
        ...companyNodes,
    ] : [];
    const edges: Edge[] = selectedUser ? companies.map((company) => ({
        id: `user-${selectedUser.id}-${company.id}`,
        source: 'selected-user',
        target: company.id,
    })) : [];

    return (
        <div style={{
            marginTop: "50px",
            marginRight: "50px",
            marginBottom: "50px",
            marginLeft: "50px",
        }}>
            <h3 style={{ textAlign: 'left' }}>Managed companies graph</h3>
            {!selectedUser && <p>Select a user to view their managed companies.</p>}
            <div
                style={{
                    // width: '100%',
                    height: '80vh',
                    border: '3px solid #59636e',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                }}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    colorMode={colorMode}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    fitView
                >
                    <MiniMap />
                    <Controls />
                    <Background color="#ccc" gap={10} variant={BackgroundVariant.Dots} />
                </ReactFlow>
            </div>
        </div>
    );


}