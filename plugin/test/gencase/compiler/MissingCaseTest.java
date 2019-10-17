package gencase.compiler;

import com.intellij.openapi.compiler.CompilationException;
import com.intellij.openapi.module.Module;
import com.intellij.openapi.roots.ModuleRootManager;
import com.intellij.openapi.vfs.VFileProperty;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.PsiFile;
import com.intellij.psi.impl.PsiManagerEx;
import com.intellij.testFramework.LightVirtualFile;
import com.intellij.testFramework.ParsingTestCase;
import gencase.GenCaseParserDefinition;
import junit.framework.TestCase;
import org.mockito.Mockito;

import static org.mockito.Matchers.anyBoolean;
import static org.mockito.Matchers.eq;

public class MissingCaseTest extends ParsingTestCase {

    private Module module;
    private PsiManagerEx psiManager;

    public MissingCaseTest() {
        super("", "gcl", new GenCaseParserDefinition());
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        VirtualFile src = Mockito.mock(VirtualFile.class);
        Mockito.when(src.isDirectory()).thenReturn(true);
        Mockito.when(src.isValid()).thenReturn(true);
        Mockito.when(src.is(eq(VFileProperty.SYMLINK))).thenReturn(false);
        Mockito.when(src.getChildren()).thenReturn(new VirtualFile[] {});

        ModuleRootManager rootManager = Mockito.mock(ModuleRootManager.class);
        Mockito.when(rootManager.getSourceRoots(anyBoolean())).thenReturn(new VirtualFile[] { src });
        module = Mockito.mock(Module.class);
        Mockito.when(module.getComponent(eq(ModuleRootManager.class))).thenReturn(rootManager);
        psiManager = Mockito.mock(PsiManagerEx.class);
    }

    public void testMissingCase() {
        try {
            new Compiler().findCase(module, psiManager);
            TestCase.fail();
        } catch (CompilationException ex) {
            TestCase.assertEquals(1, ex.getMessages().size());
            TestCase.assertEquals("No case found", ex.getMessages().stream()
                .findFirst().orElseThrow(() -> new IllegalStateException("no message"))
                .getText());
        }
    }

    @Override
    protected String getTestDataPath() {
        return "test/resources/compiler";
    }

    @Override
    protected boolean includeRanges() {
        return true;
    }

}
