import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiTestPanel } from "../debug/api-test-panel"

export function ErrorMonitorView() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Error Log</CardTitle>
          <CardDescription>Recent application errors</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error log content will go here */}
          <p>No errors to display.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Testing</CardTitle>
          <CardDescription>Test specific API endpoints for debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <ApiTestPanel />
        </CardContent>
      </Card>
    </div>
  )
}
