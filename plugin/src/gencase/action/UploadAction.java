package gencase.action;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.DataContext;
import com.intellij.openapi.actionSystem.DataKeys;
import com.intellij.openapi.compiler.CompilerPaths;
import com.intellij.openapi.module.Module;
import com.intellij.openapi.module.ModuleManager;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.ui.MessageType;
import com.intellij.openapi.ui.popup.Balloon;
import com.intellij.openapi.ui.popup.JBPopupFactory;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.openapi.wm.StatusBar;
import com.intellij.openapi.wm.WindowManager;
import com.intellij.ui.awt.RelativePoint;
import gencase.GenCaseApiClient;

import javax.swing.event.HyperlinkEvent;
import javax.swing.event.HyperlinkListener;
import java.awt.*;
import java.net.UnknownHostException;

// Single module only can be uploaded using this action
public class UploadAction extends AnAction implements HyperlinkListener {

    private WindowManager windowManager = WindowManager.getInstance();

    @Override
    public void update(AnActionEvent event) {
        Project project = event.getDataContext().getData(DataKeys.PROJECT);
        Module[] modules = ModuleManager.getInstance(project).getModules();
        event.getPresentation().setEnabled(hasSingleModule(modules) && isBuilt(modules[0]));
    }

    private boolean isBuilt(Module module) {
        VirtualFile directory = CompilerPaths.getModuleOutputDirectory(module, false);
        VirtualFile file = directory.findChild(module.getName() + ".json");
        return file != null && file.exists();
    }

    private boolean hasSingleModule(Module[] modules) {
        return modules != null && modules.length == 1;
    }

    @Override
    public void actionPerformed(AnActionEvent event) {
        DataContext ctx = event.getDataContext();
        Project project = ctx.getData(DataKeys.PROJECT);
        Module[] modules = ModuleManager.getInstance(project).getModules();
        MessageType type = MessageType.INFO;
        String message = "<b>Upload of " + project.getName() + " completed</b><br>" +
            "<a href=\"1\">Click here to navigate to site.</a>";
        if (modules.length == 1) try {
            VirtualFile directory = CompilerPaths.getModuleOutputDirectory(modules[0], false);
            GenCaseApiClient.getInstance().upload(directory.findChild(modules[0].getName() + ".json"));
        } catch (UnknownHostException ex) {
            type = MessageType.ERROR;
            message = "<b>Upload of " + project.getName() + " failed</b><br>The network is unreachable.";
        } catch (Exception ex) {
            type = MessageType.ERROR;
            message = "<b>Upload of \" + project.getName() + \" failed</b><br>" + ex.getMessage();
        } finally {
            StatusBar statusBar = windowManager.getStatusBar(DataKeys.PROJECT.getData(ctx));
            JBPopupFactory.getInstance().createHtmlTextBalloonBuilder(message, type, this)
                .setFadeoutTime(3500)
                .setBorderInsets(new Insets(10, 10, 10, 10))
                .createBalloon()
                .show(RelativePoint.getNorthEastOf(statusBar.getComponent()), Balloon.Position.atRight);
        }
    }

    @Override
    public void hyperlinkUpdate(HyperlinkEvent e) {
        if ("1".equals(e.getURL())) {
            System.out.println("Not yet implemented, should open the browser at case models page.");
        }
    }
}